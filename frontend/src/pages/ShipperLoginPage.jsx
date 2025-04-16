import React, { useEffect } from "react";
import ShipperLogin from "../components/Shipper/ShipperLogin";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ShipperLoginPage = () => {
  const navigate = useNavigate();
  const { isShipper, isLoading } = useSelector((state) => state.shipper);

  useEffect(() => {
    if (isShipper === true) {
      navigate(`/dashboard`);
    }
  }, [isLoading, isShipper, navigate]);

  return (
    <div>
      <ShipperLogin />
    </div>
  );
};

export default ShipperLoginPage;
