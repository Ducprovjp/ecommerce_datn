import React, { useEffect } from "react";
import ShipperCreate from "../../components/Shipper/ShipperCreate";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ShipperCreatePage = () => {
  const navigate = useNavigate();
  const { isShipper, shipper } = useSelector((state) => state.shipper);

  useEffect(() => {
    if (isShipper === true) {
      navigate(`/shipper/${shipper._id}`);
    }
  }, [isShipper, shipper, navigate]);

  return (
    <div>
      <ShipperCreate />
    </div>
  );
};

export default ShipperCreatePage;
