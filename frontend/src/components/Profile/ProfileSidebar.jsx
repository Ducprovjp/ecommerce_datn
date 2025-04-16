import React from "react";
import { AiOutlineLogin, AiOutlineMessage } from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";
import { HiOutlineReceiptRefund, HiOutlineShoppingBag } from "react-icons/hi";
import { RxPerson } from "react-icons/rx";
import { Link, useNavigate } from "react-router-dom";
import {
  MdOutlineAdminPanelSettings,
  MdOutlineTrackChanges,
} from "react-icons/md";
import { TbAddressBook } from "react-icons/tb";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ProfileSidebar = ({ active, setActive }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const logoutHandler = () => {
    axios
      .get(`${server}/user/logout`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        window.location.reload(true);
        navigate("/login");
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };

  return (
    <div className="w-full bg-white shadow-sm rounded-[10px] p-4 pt-8">
      {/* Profile */}
      <div
        className="flex items-center cursor-pointer w-full mb-2 800px:mb-2 rounded-md 800px:hover:bg-cyan-100 800px:hover:scale-105 transition-all duration-200 800px:py-1 800px:px-3"
        onClick={() => setActive(1)}
        aria-label="View Profile"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-cyan-100 hover:scale-105 transition-all duration-200 800px:hover:bg-transparent 800px:hover:scale-100">
          <RxPerson
            size={20}
            color={active === 1 ? "red" : "#555"}
            className="min-w-[20px] z-10"
          />
        </div>
        <span
          className={`pl-3 ${
            active === 1 ? "text-red-500" : "text-gray-700"
          } 800px:block hidden font-medium`}
        >
          Profile
        </span>
      </div>

      {/* Orders */}
      <div
        className="flex items-center cursor-pointer w-full mb-2 800px:mb-2 rounded-md 800px:hover:bg-cyan-100 800px:hover:scale-105 transition-all duration-200 800px:py-1 800px:px-3"
        onClick={() => setActive(2)}
        aria-label="View Orders"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-cyan-100 hover:scale-105 transition-all duration-200 800px:hover:bg-transparent 800px:hover:scale-100">
          <HiOutlineShoppingBag
            size={20}
            color={active === 2 ? "red" : "#555"}
            className="min-w-[20px] z-10"
          />
        </div>
        <span
          className={`pl-3 ${
            active === 2 ? "text-red-500" : "text-gray-700"
          } 800px:block hidden font-medium`}
        >
          Orders
        </span>
      </div>

      {/* Refunds */}
      <div
        className="flex items-center cursor-pointer w-full mb-2 800px:mb-2 rounded-md 800px:hover:bg-cyan-100 800px:hover:scale-105 transition-all duration-200 800px:py-1 800px:px-3"
        onClick={() => setActive(3)}
        aria-label="View Refunds"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-cyan-100 hover:scale-105 transition-all duration-200 800px:hover:bg-transparent 800px:hover:scale-100">
          <HiOutlineReceiptRefund
            size={20}
            color={active === 3 ? "red" : "#555"}
            className="min-w-[20px] z-10"
          />
        </div>
        <span
          className={`pl-3 ${
            active === 3 ? "text-red-500" : "text-gray-700"
          } 800px:block hidden font-medium`}
        >
          Refunds
        </span>
      </div>

      {/* Inbox */}
      <div
        className="flex items-center cursor-pointer w-full mb-2 800px:mb-2 rounded-md 800px:hover:bg-cyan-100 800px:hover:scale-105 transition-all duration-200 800px:py-1 800px:px-3"
        onClick={() => {
          setActive(4);
          navigate("/inbox");
        }}
        aria-label="View Inbox"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-cyan-100 hover:scale-105 transition-all duration-200 800px:hover:bg-transparent 800px:hover:scale-100">
          <AiOutlineMessage
            size={20}
            color={active === 4 ? "red" : "#555"}
            className="min-w-[20px] z-10"
          />
        </div>
        <span
          className={`pl-3 ${
            active === 4 ? "text-red-500" : "text-gray-700"
          } 800px:block hidden font-medium`}
        >
          Inbox
        </span>
      </div>

      {/* Track Order */}
      <div
        className="flex items-center cursor-pointer w-full mb-2 800px:mb-2 rounded-md 800px:hover:bg-cyan-100 800px:hover:scale-105 transition-all duration-200 800px:py-1 800px:px-3"
        onClick={() => setActive(5)}
        aria-label="Track Order"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-cyan-100 hover:scale-105 transition-all duration-200 800px:hover:bg-transparent 800px:hover:scale-100">
          <MdOutlineTrackChanges
            size={20}
            color={active === 5 ? "red" : "#555"}
            className="min-w-[20px] z-10"
          />
        </div>
        <span
          className={`pl-3 ${
            active === 5 ? "text-red-500" : "text-gray-700"
          } 800px:block hidden font-medium`}
        >
          Track Order
        </span>
      </div>

      {/* Change Password */}
      <div
        className="flex items-center cursor-pointer w-full mb-2 800px:mb-2 rounded-md 800px:hover:bg-cyan-100 800px:hover:scale-105 transition-all duration-200 800px:py-1 800px:px-3"
        onClick={() => setActive(6)}
        aria-label="Change Password"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-cyan-100 hover:scale-105 transition-all duration-200 800px:hover:bg-transparent 800px:hover:scale-100">
          <RiLockPasswordLine
            size={20}
            color={active === 6 ? "red" : "#555"}
            className="min-w-[20px] z-10"
          />
        </div>
        <span
          className={`pl-3 ${
            active === 6 ? "text-red-500" : "text-gray-700"
          } 800px:block hidden font-medium`}
        >
          Change Password
        </span>
      </div>

      {/* Address */}
      <div
        className="flex items-center cursor-pointer w-full mb-2 800px:mb-2 rounded-md 800px:hover:bg-cyan-100 800px:hover:scale-105 transition-all duration-200 800px:py-1 800px:px-3"
        onClick={() => setActive(7)}
        aria-label="View Address"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-cyan-100 hover:scale-105 transition-all duration-200 800px:hover:bg-transparent 800px:hover:scale-100">
          <TbAddressBook
            size={20}
            color={active === 7 ? "red" : "#555"}
            className="min-w-[20px] z-10"
          />
        </div>
        <span
          className={`pl-3 ${
            active === 7 ? "text-red-500" : "text-gray-700"
          } 800px:block hidden font-medium`}
        >
          Address
        </span>
      </div>

      {/* Admin Dashboard */}
      {user && user?.role === "Admin" && (
        <Link to="/admin/dashboard" className="block w-full">
          <div
            className="flex items-center cursor-pointer w-full mb-2 800px:mb-2 rounded-md 800px:hover:bg-cyan-100 800px:hover:scale-105 transition-all duration-200 800px:py-1 800px:px-3"
            onClick={() => setActive(8)}
            aria-label="View Admin Dashboard"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-cyan-100 hover:scale-105 transition-all duration-200 800px:hover:bg-transparent 800px:hover:scale-100">
              <MdOutlineAdminPanelSettings
                size={20}
                color={active === 8 ? "red" : "#555"}
                className="min-w-[20px] z-10"
              />
            </div>
            <span
              className={`pl-3 ${
                active === 8 ? "text-red-500" : "text-gray-700"
              } 800px:block hidden font-medium`}
            >
              Admin Dashboard
            </span>
          </div>
        </Link>
      )}

      {/* Logout */}
      <div
        className="flex items-center cursor-pointer w-full mb-2 800px:mb-2 rounded-md 800px:hover:bg-cyan-100 800px:hover:scale-105 transition-all duration-200 800px:py-1 800px:px-3"
        onClick={logoutHandler}
        aria-label="Logout"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-cyan-100 hover:scale-105 transition-all duration-200 800px:hover:bg-transparent 800px:hover:scale-100">
          <AiOutlineLogin
            size={20}
            color={active === 9 ? "red" : "#555"}
            className="min-w-[20px] z-10"
          />
        </div>
        <span
          className={`pl-3 ${
            active === 9 ? "text-red-500" : "text-gray-700"
          } 800px:block hidden font-medium`}
        >
          Logout
        </span>
      </div>
    </div>
  );
};

export default ProfileSidebar;
