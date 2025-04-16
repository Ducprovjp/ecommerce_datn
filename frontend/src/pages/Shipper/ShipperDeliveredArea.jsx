import React from "react";
import ShipperDashboardHeader from "../../components/Shipper/Layout/ShipperDashboardHeader";
import ShipperDashboardSideBar from "../../components/Shipper/Layout/ShipperDashboardSideBar";
import DeliveredArea from "../../components/Shipper/DeliveredArea";

const ShipperDeliveredArea = () => {
  return (
    <div>
      <ShipperDashboardHeader />
      <div className="flex justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <ShipperDashboardSideBar active={4} />
        </div>
        <div className="w-full justify-center flex">
          <DeliveredArea />
        </div>
      </div>
    </div>
  );
};

export default ShipperDeliveredArea;
