import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { RxCross1 } from "react-icons/rx";
import { FaMoneyBillWave } from "react-icons/fa";
import styles from "../../styles/styles";

const PaymentInfo = ({
  user,
  open,
  setOpen,
  paypalPaymentHandler,
  vnpayPaymentHandler,
  cashOnDeliveryHandler,
}) => {
  const [select, setSelect] = useState(0);

  const createOrder = (data, actions) => {
    const totalPriceInVND = user?.cart?.reduce(
      (acc, item) => acc + item.qty * item.discountPrice,
      0
    );
    const exchangeRate = 24000;
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

  const onApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      const { payer } = details;
      if (payer) {
        await paypalPaymentHandler(payer);
      }
    } catch (error) {
      console.error("PayPal capture error:", error);
    }
  };

  return (
    <div className="w-full 800px:w-[95%] bg-[#fff] rounded-md p-5 pb-8">
      <div>
        <div className="flex w-full pb-5 border-b mb-2 items-center">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(2)}
          >
            {select === 2 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1] flex items-center">
            Pay with PayPal
            <img
              src="https://res.cloudinary.com/dh2tqw58o/image/upload/v1749914871/paypal_es85nt.png"
              alt="PayPal"
              className="ml-2 h-[55px] w-auto"
            />
          </h4>
        </div>

        {select === 2 ? (
          <div className="w-full flex flex-col border-b">
            <div
              className={`${styles.button} !bg-[#f63b60] text-white h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600] w-[150px]`}
              onClick={() => setOpen(true)}
            >
              Pay Now
            </div>
            <div className="p-5 text-[20px] text-[#555] mt-2">
              (Số tiền sẽ được chuyển đổi sang USD khi thanh toán qua PayPal, tỷ
              giá tham khảo: 1 USD = 24,000 VND)
            </div>
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
      <div>
        <div className="flex w-full pb-5 border-b mb-2 items-center">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(3)}
          >
            {select === 3 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1] flex items-center">
            Pay with VNPAY
            <img
              src="https://res.cloudinary.com/dh2tqw58o/image/upload/v1749914807/vnpay-logo-vinadesign-25-12-57-55_aszu0v.jpg"
              alt="VNPAY"
              className="ml-2 h-[45px] w-auto"
            />
          </h4>
        </div>

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
      <div>
        <div className="flex w-full pb-5 border-b mb-2 items-center">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(4)}
          >
            {select === 4 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1] flex items-center">
            Cash on Delivery
            <FaMoneyBillWave className="ml-2 text-[30px] text-[#008000]" />
          </h4>
        </div>

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

export default PaymentInfo;