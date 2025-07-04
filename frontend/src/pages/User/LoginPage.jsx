import React, { useEffect } from "react";
import Login from "../../components/Login/Login";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Đọc đường dẫn trước đó (from) nếu có, mặc định về "/"
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, location.state]);

  return (
    <div>
      <Login />
    </div>
  );
};

export default LoginPage;
