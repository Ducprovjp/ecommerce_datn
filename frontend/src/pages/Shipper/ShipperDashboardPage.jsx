import React from "react";
import ShipperDashboardHeader from "../../components/Shipper/Layout/ShipperDashboardHeader";
import ShipperDashboardSideBar from "../../components/Shipper/Layout/ShipperDashboardSideBar";
import ShipperDashboardHero from "../../components/Shipper/ShipperDashboardHero";

const ShipperDashboardPage = () => {
  return (
    <div>
      <ShipperDashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <ShipperDashboardSideBar active={1} />
        </div>
        <ShipperDashboardHero />
      </div>
    </div>
  );
};

export default ShipperDashboardPage;
