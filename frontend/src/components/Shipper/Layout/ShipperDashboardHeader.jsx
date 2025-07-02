import React from "react";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FiPackage } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const ShipperDashboardHeader = () => {
  const { shipper } = useSelector((state) => state.shipper);
  return (
    <div className="w-full h-[80px] bg-white shadow sticky top-0 left-0 z-30 flex items-center justify-between px-4">
      <div className="relative w-40 h-20 rounded-2xl overflow-hidden">
        <Link to="/">
          <img
            className="w-full h-full object-cover rounded-2xl"
            src="https://blog.logrocket.com/wp-content/uploads/2023/03/How-NestJS-middleware-works.png"
            alt=""
            style={{
              WebkitMaskImage:
                "radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "cover",
            }}
          />
        </Link>
      </div>
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <Link to="/shipper-dashboard-orders" className="800px:block hidden">
            <FiPackage color="#555" size={30} className="mx-5 cursor-pointer" />
          </Link>
          <Link to="/shipper-dashboard-messages" className="800px:block hidden">
            <BiMessageSquareDetail
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          <Link
            to="/shipper-dashboard-delivered-area"
            className="800px:block hidden"
          >
            <TbTruckDelivery
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          <Link to={`/shipper/${shipper._id}`}>
            <img
              src={shipper.avatar}
              alt="Shipper Avatar"
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShipperDashboardHeader;
