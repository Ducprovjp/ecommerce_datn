import React from "react";
import { RxDashboard } from "react-icons/rx";
import { FiPackage } from "react-icons/fi";
import { BiMessageSquareDetail } from "react-icons/bi";
import { CiSettings } from "react-icons/ci";
import { TbTruckDelivery } from "react-icons/tb";
import { Link } from "react-router-dom";

const ShipperDashboardSideBar = ({ active }) => {
  return (
    <div className="w-full h-[90vh] bg-white shadow-sm overflow-y-scroll sticky top-0 left-0 z-10">
      {/* Dashboard */}
      <div className="w-full flex items-center p-4">
        <Link to="/shipper-dashboard" className="w-full flex items-center">
          <RxDashboard
            size={30}
            color={`${active === 1 ? "crimson" : "#555"}`}
          />
          <h5
            className={`hidden 800px:block pl-2 text-[18px] font-[400] ${
              active === 1 ? "text-[crimson]" : "text-[#555]"
            }`}
          >
            Dashboard
          </h5>
        </Link>
      </div>

      {/* Orders */}
      <div className="w-full flex items-center p-4">
        <Link
          to="/shipper-dashboard-orders"
          className="w-full flex items-center"
        >
          <FiPackage size={30} color={`${active === 2 ? "crimson" : "#555"}`} />
          <h5
            className={`hidden 800px:block pl-2 text-[18px] font-[400] ${
              active === 2 ? "text-[crimson]" : "text-[#555]"
            }`}
          >
            Orders
          </h5>
        </Link>
      </div>

      {/* Messages */}
      <div className="w-full flex items-center p-4">
        <Link
          to="/shipper-dashboard-messages"
          className="w-full flex items-center"
        >
          <BiMessageSquareDetail
            size={30}
            color={`${active === 3 ? "crimson" : "#555"}`}
          />
          <h5
            className={`hidden 800px:block pl-2 text-[18px] font-[400] ${
              active === 3 ? "text-[crimson]" : "text-[#555]"
            }`}
          >
            Messages
          </h5>
        </Link>
      </div>

      {/* Delivered Area */}
      <div className="w-full flex items-center p-4">
        <Link
          to="/shipper-dashboard-delivered-area"
          className="w-full flex items-center"
        >
          <TbTruckDelivery
            size={30}
            color={`${active === 4 ? "crimson" : "#555"}`}
          />
          <h5
            className={`hidden 800px:block pl-2 text-[18px] font-[400] ${
              active === 4 ? "text-[crimson]" : "text-[#555]"
            }`}
          >
            Delivered Area
          </h5>
        </Link>
      </div>

      {/* Settings */}
      <div className="w-full flex items-center p-4">
        <Link to="/shipper-settings" className="w-full flex items-center">
          <CiSettings
            size={30}
            color={`${active === 5 ? "crimson" : "#555"}`}
          />
          <h5
            className={`hidden 800px:block pl-2 text-[18px] font-[400] ${
              active === 5 ? "text-[crimson]" : "text-[#555]"
            }`}
          >
            Settings
          </h5>
        </Link>
      </div>
    </div>
  );
};

export default ShipperDashboardSideBar;
