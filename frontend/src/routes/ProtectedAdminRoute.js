import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "../components/Layout/Loader";

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.user);
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== "Admin"))) {
      // Chỉ chuyển hướng nếu không đang load và không phải admin
    }
  }, [isLoading, isAuthenticated, user, location.pathname]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user && user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;