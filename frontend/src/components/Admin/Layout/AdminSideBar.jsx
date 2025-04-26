import React from "react";
import { FiShoppingBag } from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { Link } from "react-router-dom";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BsHandbag } from "react-icons/bs";
import { MdOutlineLocalOffer } from "react-icons/md";
import { AiOutlineSetting } from "react-icons/ai";

const AdminSideBar = ({ active }) => {
  return (
    <div className="w-full h-[90vh] bg-white shadow-sm overflow-y-scroll sticky top-0 left-0 z-10">
      {[
        {
          to: "/admin/dashboard",
          icon: <RxDashboard size={30} />,
          label: "Dashboard",
          id: 1,
        },
        {
          to: "/admin-orders",
          icon: <FiShoppingBag size={30} />,
          label: "All Orders",
          id: 2,
        },
        {
          to: "/admin-sellers",
          icon: <GrWorkshop size={30} />,
          label: "All Sellers",
          id: 3,
        },
        {
          to: "/admin-users",
          icon: <HiOutlineUserGroup size={30} />,
          label: "All Users",
          id: 4,
        },
        {
          to: "/admin-shippers",
          icon: <HiOutlineUserGroup size={30} />,
          label: "All Shippers",
          id: 9,
        },
        {
          to: "/admin-products",
          icon: <BsHandbag size={30} />,
          label: "All Products",
          id: 5,
        },
        {
          to: "/admin-events",
          icon: <MdOutlineLocalOffer size={30} />,
          label: "All Events",
          id: 6,
        },
        {
          to: "/admin-withdraw-request",
          icon: <CiMoneyBill size={30} />,
          label: "Withdraw Request",
          id: 7,
        },
        {
          to: "/profile",
          icon: <AiOutlineSetting size={30} />,
          label: "Settings",
          id: 8,
        },
      ].map((item) => (
        <div
          key={item.id}
          className={`w-full flex items-center p-4 hover:bg-cyan-100 rounded-md transition duration-200 ${
            active === item.id ? "bg-cyan-100" : ""
          }`}
        >
          <Link
            to={item.to}
            className="w-full flex items-center cursor-pointer"
          >
            <span
              className={`transition duration-150 ${
                active === item.id ? "text-crimson" : "text-[#555]"
              }`}
            >
              {React.cloneElement(item.icon, {
                color: active === item.id ? "crimson" : "#555",
              })}
            </span>
            <h5
              className={`hidden 800px:block pl-2 text-[18px] font-[500] transition-all duration-200 ${
                active === item.id ? "text-crimson" : "text-[#555]"
              } hover:translate-x-1`}
            >
              {item.label}
            </h5>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AdminSideBar;
