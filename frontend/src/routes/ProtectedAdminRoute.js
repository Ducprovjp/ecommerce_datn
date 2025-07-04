import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "../components/Layout/Loader";

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.user
  );
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    // Gửi kèm state để LoginPage biết điều hướng quay lại sau khi đăng nhập
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user && user.role !== "Admin") {
    // Người đã login nhưng không phải Admin thì cho về trang chủ
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
