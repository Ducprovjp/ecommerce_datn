import React from "react";
import { AiOutlineGift } from "react-icons/ai";
import { MdOutlineLocalOffer } from "react-icons/md";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";

const DashboardHeader = () => {
  const { seller } = useSelector((state) => state.seller);
  return (
    <div className="w-full h-[80px] bg-white shadow sticky top-0 left-0 z-30 flex items-center justify-between px-4">
      <div>
        {/* <Link to="/dashboard">
          <img
            src="https://shopo.quomodothemes.website/assets/images/logo.svg"
            alt=""
          />
        </Link> */}
        <div className="relative w-40 h-20 rounded-2xl overflow-hidden">
          <Link to="/dashboard">
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
      </div>
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <Link to="/dashboard-coupouns" className="800px:block hidden">
            <AiOutlineGift
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          <Link to="/dashboard-events" className="800px:block hidden">
            <MdOutlineLocalOffer
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          <Link to="/dashboard-products" className="800px:block hidden">
            <FiShoppingBag
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          <Link to="/dashboard-orders" className="800px:block hidden">
            <FiPackage color="#555" size={30} className="mx-5 cursor-pointer" />
          </Link>
          <Link to="/dashboard-messages" className="800px:block hidden">
            <BiMessageSquareDetail
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          <Link to={`/shop/${seller._id}`}>
            <img
              src={seller.avatar}
              alt=""
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
