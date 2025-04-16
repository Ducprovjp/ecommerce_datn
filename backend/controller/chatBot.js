const express = require("express");
const axios = require("axios");
const hubspot = require("@hubspot/api-client");
const { GoogleAuth } = require("google-auth-library");
const router = express.Router();

// Import models từ file schema riêng
const Product = require("../model/product");
const Order = require("../model/order");

// Kết nối HubSpot
const hubspotClient = new hubspot.Client({
  accessToken: process.env.HUBSPOT_TOKEN,
});

// Hàm lấy Dialogflow token động
async function getDialogflowToken() {
  const auth = new GoogleAuth({
    keyFile: "./config/service-account.json",
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

// Webhook cho Dialogflow
router.post("/webhook", async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  let responseText = "";

  try {
    if (intent === "ask_product_price") {
      const productName = req.body.queryResult.parameters.product;
      console.log("Product Name from Dialogflow:", productName);
      // Tìm kiếm linh hoạt hơn với regex
      const product = await Product.findOne({
        name: { $regex: productName, $options: "i" }, // Không phân biệt hoa thường
      });
      console.log("Product found:", product);
      responseText = product
        ? `Giá của ${product.name} là ${product.discountPrice} VNĐ${
            product.originalPrice &&
            product.originalPrice > product.discountPrice
              ? ` (giá gốc: ${product.originalPrice} VNĐ)`
              : ""
          }`
        : "Không tìm thấy sản phẩm. Bạn có thể thử hỏi về danh mục, ví dụ: 'Có giày dép gì không?'";
    } else if (intent === "place_order") {
      const customer = req.body.queryResult.parameters;
      await hubspotClient.crm.contacts.basicApi.create({
        properties: {
          firstname: customer.name || "Khách hàng",
          email: customer.email,
          phone: customer.phone,
        },
      });
      await hubspotClient.crm.deals.basicApi.create({
        properties: {
          dealname: `Đơn hàng từ ${customer.name || "Khách hàng"}`,
          amount: customer.amount || "0",
          dealstage: "presentationscheduled",
        },
      });
      responseText =
        "Đơn hàng của bạn đã được ghi nhận! Chúng tôi sẽ liên hệ sớm.";
    } else if (intent === "technical_support") {
      const issue = req.body.queryResult.parameters.issue;
      await hubspotClient.crm.tickets.basicApi.create({
        properties: {
          subject: `Yêu cầu hỗ trợ: ${issue}`,
          content: `Khách hàng cần hỗ trợ về ${issue}`,
          hs_pipeline_stage: "1",
        },
      });
      responseText =
        "Yêu cầu hỗ trợ của bạn đã được ghi nhận. Chúng tôi sẽ phản hồi sớm!";
    } else if (intent === "check_order_status") {
      const orderId = req.body.queryResult.parameters.orderId;
      const order = await Order.findOne({ "paymentInfo.orderId": orderId });
      responseText = order
        ? `Trạng thái đơn hàng ${orderId}: ${order.status}. Tổng giá: ${
            order.totalPrice
          } VNĐ. ${
            order.deliveredAt
              ? `Đã giao ngày ${new Date(order.deliveredAt).toLocaleDateString(
                  "vi-VN"
                )}`
              : "Chưa giao."
          }`
        : "Không tìm thấy đơn hàng với mã này!";
    } else if (intent === "search_by_category") {
      const category = req.body.queryResult.parameters.category;
      console.log("Category from Dialogflow:", category);
      const products = await Product.find({
        category: { $regex: category, $options: "i" },
      }).limit(3); // Giới hạn 3 sản phẩm
      console.log("Products found:", products);
      if (products.length > 0) {
        responseText = `Danh mục ${category} có các sản phẩm: \n${products
          .map(
            (p) =>
              `- ${p.name}: ${p.discountPrice} VNĐ${
                p.originalPrice && p.originalPrice > p.discountPrice
                  ? ` (giá gốc: ${p.originalPrice} VNĐ)`
                  : ""
              }`
          )
          .join("\n")}`;
      } else {
        responseText = `Hiện không có sản phẩm nào trong danh mục ${category}. Bạn muốn thử danh mục khác không?`;
      }
    } else if (intent === "suggest_product") {
      const products = await Product.aggregate([
        { $sample: { size: 3 } }, // Lấy ngẫu nhiên 3 sản phẩm
      ]);
      if (products.length > 0) {
        responseText = `Dưới đây là một vài sản phẩm gợi ý: \n${products
          .map(
            (p) =>
              `- ${p.name}: ${p.discountPrice} VNĐ${
                p.originalPrice && p.originalPrice > p.discountPrice
                  ? ` (giá gốc: ${p.originalPrice} VNĐ)`
                  : ""
              }`
          )
          .join("\n")}`;
      } else {
        responseText =
          "Hiện tại không có sản phẩm nào để gợi ý. Bạn muốn hỏi về danh mục cụ thể không?";
      }
    } else {
      responseText =
        "Xin lỗi, tôi chưa hiểu yêu cầu của bạn. Bạn muốn hỏi về sản phẩm, đơn hàng, hay cần hỗ trợ gì khác?";
    }

    res.json({ fulfillmentText: responseText });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.json({ fulfillmentText: "Đã có lỗi xảy ra, vui lòng thử lại!" });
  }
});

// API để frontend gửi tin nhắn đến Dialogflow
router.post("/dialogflow", async (req, res) => {
  const { message } = req.body;
  try {
    const token = await getDialogflowToken();
    const dialogflowResponse = await axios.post(
      `https://dialogflow.googleapis.com/v2/projects/${process.env.DIALOGFLOW_PROJECT_ID}/agent/sessions/123456:detectIntent`,
      {
        queryInput: { text: { text: message, languageCode: "vi" } },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json({
      reply: dialogflowResponse.data.queryResult.fulfillmentText,
    });
  } catch (error) {
    console.error("Dialogflow Error:", error);
    res.json({ reply: "Lỗi kết nối Dialogflow!" });
  }
});

module.exports = router;
