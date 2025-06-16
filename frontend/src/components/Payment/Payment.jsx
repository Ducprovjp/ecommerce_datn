import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { postRequest } from "../../request/api";
import PaymentInfo from "./PaymentInfo";
import CartData from "./CartData";
import { getAllProducts } from "../../redux/actions/product";
import styles from "../../styles/styles";

const Payment = () => {
  const [orderData, setOrderData] = useState([]);
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [vnpayOrderId, setVnpayOrderId] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const orderData = JSON.parse(localStorage.getItem("latestOrder"));
    setOrderData(orderData);
  }, []);

  useEffect(() => {
    return () => {
      if (vnpayOrderId) {
        postRequest("/order/cancel-vnpay-order", { orderId: vnpayOrderId })
          .then(() => console.log("VNPay order cancelled"))
          .catch((err) => console.error("Error cancelling VNPay order:", err));
      }
    };
  }, [vnpayOrderId]);

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user && user,
    totalPrice: orderData?.totalPrice,
    couponCode: orderData?.couponCode, // Include couponCode
  };

  const paypalPaymentHandler = async (paymentInfo) => {
    try {
      order.paymentInfo = {
        id: paymentInfo.payer_id,
        status: "succeeded",
        type: "Paypal",
      };

      const res = await postRequest("/order/create-order", order);
      if (!res.success) {
        throw new Error(res.message || "Sản phẩm tạm thời hết hàng hoặc đã được giữ chỗ");
      }

      setOpen(false);
      navigate("/order/success");
      toast.success("Order successful!");
      localStorage.setItem("cartItems", JSON.stringify([]));
      localStorage.setItem("latestOrder", JSON.stringify([]));
      // dispatch(getAllProducts())
      window.location.reload();
    } catch (error) {
      console.error("PayPal order error:", error);
      toast.error(error.message || "Sản phẩm tạm thời hết hàng hoặc đã được giữ chỗ");
    }
  };

  const createVNPAYPaymentUrl = async () => {
    try {
      const res = await postRequest("/payment/vnpay", order);
      if (!res.success) {
        throw new Error(res.message || "Sản phẩm tạm thời hết hàng hoặc đã được giữ chỗ");
      }
      return { paymentUrl: res.paymentUrl, orderId: res.orderId };
    } catch (error) {
      console.error("VNPAY payment URL error:", error);
      throw error;
    }
  };

  const vnpayPaymentHandler = async () => {
    try {
      toast.info("Giao dịch VNPay sẽ hết hạn sau 15 phút");
      const { paymentUrl, orderId } = await createVNPAYPaymentUrl();
      if (!paymentUrl) {
        throw new Error("No payment URL returned");
      }
      setVnpayOrderId(orderId);
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("VNPAY handler error:", error);
      toast.error(error.message || "Sản phẩm tạm thời hết hàng hoặc đã được giữ chỗ");
    }
  };

  const cashOnDeliveryHandler = async (e) => {
    e.preventDefault();
    try {
      order.paymentInfo = {
        type: "Cash On Delivery",
      };

      const res = await postRequest("/order/create-order", order);
      if (!res.success) {
        throw new Error(res.message || "Sản phẩm tạm thời hết hàng hoặc đã được giữ chỗ");
      }

      setOpen(false);
      navigate("/order/success");
      toast.success("Order successful!");
      localStorage.setItem("cartItems", JSON.stringify([]));
      localStorage.setItem("latestOrder", JSON.stringify([]));
      dispatch(getAllProducts())
      // window.location.reload();
    } catch (error) {
      console.error("COD order error:", error);
      toast.error(error.message || "Sản phẩm tạm thời hết hàng hoặc đã được giữ chỗ");
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%]">
          <PaymentInfo
            user={user}
            open={open}
            setOpen={setOpen}
            paypalPaymentHandler={paypalPaymentHandler}
            vnpayPaymentHandler={vnpayPaymentHandler}
            cashOnDeliveryHandler={cashOnDeliveryHandler}
          />
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <CartData orderData={orderData} />
        </div>
      </div>
    </div>
  );
};

export default Payment;