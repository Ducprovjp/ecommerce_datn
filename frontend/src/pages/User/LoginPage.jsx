import React, { useEffect } from "react";
import Login from "../../components/Login/Login";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSelector((state) => state.user);
  // if user is login then redirect to home page
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isLoading, isAuthenticated]);
  return (
    <div>
      <Login />
    </div>
  );
};

export default LoginPage;
