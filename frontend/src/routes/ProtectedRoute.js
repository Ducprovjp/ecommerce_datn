import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "../components/Layout/Loader";
import { loadUser } from "../redux/actions/user"; // Giả định action load user

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.user);
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(loadUser()); // Dispatch action để kiểm tra user
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    if (isLoading || isAuthenticated === null) {
      checkAuth();
    } else {
      setIsCheckingAuth(false);
    }
  }, [dispatch, isLoading, isAuthenticated]);

  if (isLoading || isCheckingAuth) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;