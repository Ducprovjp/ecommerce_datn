import React from "react";
import Footer from "../../components/Layout/Footer";
import Header from "../../components/Layout/Header";
import Lottie from "react-lottie";
import animationData from "../../Assests/animations/failure.json"; // Đảm bảo file này tồn tại

const OrderFailurePage = () => {
  return (
    <div>
      <Header />
      <Failure />
      <Footer />
    </div>
  );
};

const Failure = () => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div>
      <Lottie options={defaultOptions} width={300} height={300} />
      <h5 className="text-center mb-14 text-[25px] text-[#000000a1]">
        Your order has failed 😔
      </h5>
      <br />
      <br />
    </div>
  );
};

export default OrderFailurePage;