import React from "react";
import ShipperDashboardHeader from "../../components/Shipper/Layout/ShipperDashboardHeader";
import ShipperDashboardSideBar from "../../components/Shipper/Layout/ShipperDashboardSideBar";
import ShipperDashboardMessages from "../../components/Shipper/ShipperDashboardMessages";

const ShipperInboxPage = () => {
  return (
    <div>
      <ShipperDashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <ShipperDashboardSideBar active={3} />
        </div>
        <ShipperDashboardMessages />
      </div>
    </div>
  );
};

export default ShipperInboxPage;
