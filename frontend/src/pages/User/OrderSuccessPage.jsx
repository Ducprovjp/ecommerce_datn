// OrderSuccessPage.jsx

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/Layout/Footer";
import Header from "../../components/Layout/Header";
import Lottie from "react-lottie";
import animationData from "../../Assests/animations/107043-success.json";
import { clearCart } from "../../redux/actions/cart";
import { getAllProducts } from "../../redux/actions/product";

const OrderSuccessPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("clearCart") === "true") {
      dispatch(clearCart());
      localStorage.setItem("cartItems", JSON.stringify([]));
      localStorage.setItem("latestOrder", JSON.stringify([]));
      dispatch(getAllProducts());
      console.log("Cart cleared after payment success");
    }
  }, [dispatch, location]);

  const handleGoToOrders = () => {
    navigate("/profile?tab=orders");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

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
      <Header />
      <div className="flex flex-col items-center justify-center py-12 min-h-[70vh] bg-gray-50">
        <Lottie options={defaultOptions} width={300} height={300} />
        <h5 className="text-center mb-4 text-[25px] text-[#000000a1]">
          Đặt hàng thành công 😍
        </h5>
        <p className="text-center text-gray-600 mb-8">
          Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được xử lý thành công.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleGoToOrders}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Xem đơn hàng
          </button>
          <button
            onClick={handleContinueShopping}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
