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
      // const from = location.state?.from?.pathname || "/";
      navigate("/", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div>
      <Login />
    </div>
  );
};

export default LoginPage;