import React from "react";
import ShipperDashboardHeader from "../../components/Shipper/Layout/ShipperDashboardHeader";
import ShipperDashboardSideBar from "../../components/Shipper/Layout/ShipperDashboardSideBar";
import AllOrders from "../../components/Shipper/AllOrders";

const ShipperAllOrders = () => {
  return (
    <div>
      <ShipperDashboardHeader />
      <div className="flex justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <ShipperDashboardSideBar active={2} />
        </div>
        <div className="w-full justify-center flex">
          <AllOrders />
        </div>
      </div>
    </div>
  );
};

export default ShipperAllOrders;
