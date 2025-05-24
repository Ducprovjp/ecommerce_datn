import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";
import { postRequest } from "../../request/api";

const Payment = () => {
  const [orderData, setOrderData] = useState([]);
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const orderData = JSON.parse(localStorage.getItem("latestOrder"));
    setOrderData(orderData);
  }, []);

  // PayPal
  const createOrder = (data, actions) => {
    const totalPriceInVND = orderData?.totalPrice;
    const exchangeRate = 24000; // 1 USD = 24,000 VND (cập nhật tỷ giá thực tế)
    const totalPriceInUSD = (totalPriceInVND / exchangeRate).toFixed(2);

    return actions.order
      .create({
        purchase_units: [
          {
            description: "Thanh toán đơn hàng",
            amount: {
              currency_code: "USD",
              value: totalPriceInUSD,
            },
          },
        ],
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      })
      .then((orderID) => orderID);
  };

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user && user,
    totalPrice: orderData?.totalPrice,
  };

  const onApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      const { payer } = details;
      if (payer) {
        await paypalPaymentHandler(payer);
      }
    } catch (error) {
      console.error("PayPal capture error:", error);
      toast.error(error.message || "Failed to capture PayPal payment");
    }
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
        throw new Error(res.message || "Failed to create order");
      }

      setOpen(false);
      navigate("/order/success");
      toast.success("Order successful!");
      localStorage.setItem("cartItems", JSON.stringify([]));
      localStorage.setItem("latestOrder", JSON.stringify([]));
      window.location.reload();
    } catch (error) {
      console.error("PayPal order error:", error);
      toast.error(error.message || "Failed to create order");
    }
  };

  const paymentData = {
    amount: Math.round(orderData?.totalPrice * 100),
  };

  const paymentHandler = async (e) => {
    e.preventDefault();
    try {
      const paymentRes = await postRequest("/payment/process", paymentData);
      if (!paymentRes.success) {
        throw new Error(paymentRes.message || "Failed to process payment");
      }
      const client_secret = paymentRes.client_secret;
      if (!client_secret) {
        throw new Error("Missing client secret from payment response");
      }

      if (!stripe || !elements) {
        toast.error("Stripe is not initialized");
        return;
      }

      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status === "succeeded") {
        order.paymentInfo = {
          id: result.paymentIntent.id,
          status: result.paymentIntent.status,
          type: "Credit Card",
        };

        const orderRes = await postRequest("/order/create-order", order);
        if (!orderRes.success) {
          throw new Error(orderRes.message || "Failed to create order");
        }

        setOpen(false);
        navigate("/order/success");
        toast.success("Order successful!");
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.setItem("latestOrder", JSON.stringify([]));
        window.location.reload();
      } else {
        throw new Error("Payment not successful");
      }
    } catch (error) {
      console.error("Payment handler error:", error);
      toast.error(error.message || "An error occurred during payment");
    }
  };

  const createVNPAYPaymentUrl = async () => {
    try {
      const res = await postRequest("/payment/vnpay", order);
      if (!res.success) {
        throw new Error(res.message || "Failed to create VNPAY payment URL");
      }
      return res.paymentUrl;
    } catch (error) {
      console.error("VNPAY payment URL error:", error);
      toast.error(error.message || "Failed to create VNPAY payment URL");
      return null;
    }
  };

  const vnpayPaymentHandler = async () => {
    try {
      const paymentUrl = await createVNPAYPaymentUrl();
      if (!paymentUrl) {
        throw new Error("No payment URL returned");
      }
      window.location.href = paymentUrl; // Chuyển hướng tới URL thanh toán
    } catch (error) {
      console.error("VNPAY handler error:", error);
      toast.error(error.message || "Failed to initiate VNPAY payment");
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
        throw new Error(res.message || "Failed to create order");
      }

      setOpen(false);
      navigate("/order/success");
      toast.success("Order successful!");
      localStorage.setItem("cartItems", JSON.stringify([]));
      localStorage.setItem("latestOrder", JSON.stringify([]));
      window.location.reload();
    } catch (error) {
      console.error("COD order error:", error);
      toast.error(error.message || "Failed to create order");
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
            onApprove={onApprove}
            createOrder={createOrder}
            paymentHandler={paymentHandler}
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

const PaymentInfo = ({
  user,
  open,
  setOpen,
  onApprove,
  createOrder,
  paymentHandler,
  vnpayPaymentHandler,
  cashOnDeliveryHandler,
}) => {
  const [select, setSelect] = useState(1);

  return (
    <div className="w-full 800px:w-[95%] bg-[#fff] rounded-md p-5 pb-8">
      {/* select buttons */}
      <div>
        {/* <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(1)}
          >
            {select === 1 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Pay with Debit/credit card
          </h4>
        </div> */}

        {/* pay with card */}
        {/* {select === 1 ? (
          <div className="w-full flex border-b">
            <form className="w-full" onSubmit={paymentHandler}>
              <div className="w-full flex pb-3">
                <div className="w-[50%]">
                  <label className="block pb-2">Name on Card</label>
                  <input
                    required
                    value={user && user.name}
                    className={`${styles.input} !w-[95%]`}
                  />
                </div>
                <div className="w-[50%]">
                  <label className="block pb-2">Exp Date</label>
                  <CardExpiryElement
                    className={`${styles.input}`}
                    options={{
                      style: {
                        base: {
                          fontSize: "19px",
                          lineHeight: 1.5,
                          color: "#444",
                        },
                        empty: {
                          color: "#3a120a",
                          backgroundColor: "transparent",
                          "::placeholder": {
                            color: "#444",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="w-full flex pb-3">
                <div className="w-[50%]">
                  <label className="block pb-2">Name On Card</label>
                  <CardNumberElement
                    className={`${styles.input} !h-[35px] !w-[95%]`}
                    options={{
                      style: {
                        base: {
                          fontSize: "19px",
                          lineHeight: 1.5,
                          color: "#444",
                        },
                        empty: {
                          color: "#3a120a",
                          backgroundColor: "transparent",
                          "::placeholder": {
                            color: "#444",
                          },
                        },
                      },
                    }}
                  />
                </div>
                <div className="w-[50%]">
                  <label className="block pb-2">CVV</label>
                  <CardCvcElement
                    className={`${styles.input} !h-[35px]`}
                    options={{
                      style: {
                        base: {
                          fontSize: "19px",
                          lineHeight: 1.5,
                          color: "#444",
                        },
                        empty: {
                          color: "#3a120a",
                          backgroundColor: "transparent",
                          "::placeholder": {
                            color: "#444",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <input
                type="submit"
                value="Submit"
                className={`${styles.button} !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]`}
              />
            </form>
          </div>
        ) : null} */}
      </div>

      <br />
      {/* paypal payment */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(2)}
          >
            {select === 2 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Pay with PayPal
          </h4>
        </div>

        {/* pay with payment  */}
        {/* pay with payment */}
        {select === 2 ? (
          <div className="w-full flex flex-col border-b">
            {/* Nút Pay Now */}
            <div
              className={`${styles.button} !bg-[#f63b60] text-white h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600] w-[150px]`}
              onClick={() => setOpen(true)}
            >
              Pay Now
            </div>

            {/* Thông báo tỷ giá */}
            <div className="p-5 text-[20px] text-[#555] mt-2">
              (Số tiền sẽ được chuyển đổi sang USD khi thanh toán qua PayPal, tỷ
              giá tham khảo: 1 USD = 24,000 VND)
            </div>

            {/* Popup PayPal */}
            {open && (
              <div className="w-full fixed top-0 left-0 bg-[#00000039] h-screen flex items-center justify-center z-[99999]">
                <div className="w-full 800px:w-[40%] h-screen 800px:h-[80vh] bg-white rounded-[5px] shadow flex flex-col justify-center p-8 relative overflow-y-scroll">
                  <div className="w-full flex justify-end p-3">
                    <RxCross1
                      size={30}
                      className="cursor-pointer absolute top-5 right-3"
                      onClick={() => setOpen(false)}
                    />
                  </div>
                  <PayPalScriptProvider
                    options={{
                      "client-id":
                        "ASj9QuO_fwIj6hAsrdAikOffkEEgjqqaLTYQw47ShrbvBJ0nE2b5tu8U46seu4K-pIaboKVqUfBxWJjF",
                    }}
                  >
                    <PayPalButtons
                      style={{ layout: "vertical" }}
                      onApprove={onApprove}
                      createOrder={createOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <br />
      {/* Pay with VNPAY */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(3)}
          >
            {select === 3 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Pay with VNPAY
          </h4>
        </div>

        {/* pay with VNPAY  */}
        {/* pay with VNPAY */}
        {select === 3 ? (
          <div className="w-full flex flex-col border-b">
            <div
              className={`${styles.button} !bg-[#f63b60] text-white h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600] w-[150px]`}
              onClick={vnpayPaymentHandler}
            >
              Pay now
            </div>
          </div>
        ) : null}
      </div>
      <br />
      {/* cash on delivery */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(4)}
          >
            {select === 4 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Cash on Delivery
          </h4>
        </div>

        {/* cash on delivery */}
        {select === 4 ? (
          <div className="w-full flex">
            <form className="w-full" onSubmit={cashOnDeliveryHandler}>
              <input
                type="submit"
                value="Confirm"
                className={`${styles.button} !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]`}
              />
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const CartData = ({ orderData }) => {
  const shipping = orderData?.shipping
    ? orderData.shipping.toLocaleString("vi-VN") + " VNĐ"
    : "0 VNĐ";

  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Subtotal:</h3>
        <h5 className="text-[18px] font-[600]">
          {orderData?.subTotalPrice
            ? orderData.subTotalPrice.toLocaleString("vi-VN") + " VNĐ"
            : "0 VNĐ"}
        </h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Shipping:</h3>
        <h5 className="text-[18px] font-[600]">{shipping}</h5>
      </div>
      <br />
      <div className="flex justify-between border-b pb-3">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
        <h5 className="text-[18px] font-[600]">
          {orderData?.discountPrice
            ? "- " + orderData.discountPrice.toLocaleString("vi-VN") + " VNĐ"
            : "0 VNĐ"}
        </h5>
      </div>
      <h5 className="text-[18px] font-[600] text-end pt-3">
        {orderData?.totalPrice
          ? orderData.totalPrice.toLocaleString("vi-VN") + " VNĐ"
          : "0 VNĐ"}
      </h5>
      <br />
    </div>
  );
};

export default Payment;
