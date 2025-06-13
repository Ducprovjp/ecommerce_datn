const express = require("express");
const ErrorHandler = require("./middleware/error");
const connectDatabase = require("./db/Database");
const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
const cleanupExpiredOrders = require("./utils/cleanupExpiredOrders");

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}
// connect db
connectDatabase();

// create server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.REACT_APP_BACKEND_URL}`);
});

// middlewares
app.use(express.json());
app.use(cookieParser());
// Enable CORS for all routes

app.use(
  cors({
    origin: [
      process.env.REACT_APP_FRONT_END_URL,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/", express.static("uploads"));

app.get("/test", (req, res) => {
  res.send("Hello World!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Chạy mỗi 5 phút
cron.schedule("*/5 * * * *", async () => {
  console.log("Running cleanup for expired VNPay orders...");
  await cleanupExpiredOrders();
});

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// why bodyparser?
// bodyparser is used to parse the data from the body of the request to the server (POST, PUT, DELETE, etc.)

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// routes
const user = require("./controller/user.controller");
const shop = require("./controller/shop.controller");
const shipper = require("./controller/shipper.controller");
const product = require("./controller/product.controller");
const event = require("./controller/event.controller");
const coupon = require("./controller/coupon.controller");
const payment = require("./controller/payment.controller");
const order = require("./controller/order.controller");
const message = require("./controller/message.controller");
const conversation = require("./controller/conversation.controller");
const withdraw = require("./controller/withdraw.controller");
const chatbot = require("./controller/chatBot");
app.use("/api/v2/withdraw", withdraw);

// end points
app.use("/api/v2/user", user);
app.use("/api/v2/shop", shop);
app.use("/api/v2/shipper", shipper);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);
app.use("/api/v2/order", order);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/chatbot", chatbot);

// it'for errhendel
app.use(ErrorHandler);

// Handling Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server for handling UNCAUGHT EXCEPTION! 💥`);
});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the server for ${err.message}`);
  console.log(`Shutting down the server for unhandle promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
