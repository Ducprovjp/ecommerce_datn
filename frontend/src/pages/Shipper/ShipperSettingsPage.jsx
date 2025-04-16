import React from "react";
import ShipperSettings from "../../components/Shipper/ShipperSettings";
import ShipperDashboardHeader from "../../components/Shipper/Layout/ShipperDashboardHeader";
import ShipperDashboardSideBar from "../../components/Shipper/Layout/ShipperDashboardSideBar";

const ShipperSettingsPage = () => {
  return (
    <div>
      <ShipperDashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <ShipperDashboardSideBar active={5} />
        </div>
        <ShipperSettings />
      </div>
    </div>
  );
};

export default ShipperSettingsPage;
