import React from "react";
import ShipperDashboardHeader from "../../components/Shipper/Layout/ShipperDashboardHeader";
import Footer from "../../components/Layout/Footer";
import OrderDetails from "../../components/Shipper/OrderDetails";

const ShipperOrderDetails = () => {
  return (
    <div>
      <ShipperDashboardHeader />
      <OrderDetails />
      <Footer />
    </div>
  );
};

export default ShipperOrderDetails;
