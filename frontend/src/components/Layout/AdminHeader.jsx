import React from "react";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CiMoneyBill } from "react-icons/ci";
import { GrWorkshop } from "react-icons/gr";

const AdminHeader = () => {
  const { user } = useSelector((state) => state.user);

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
          <Link to="/admin-withdraw-request" className="800px:block hidden">
            <CiMoneyBill
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          <Link to="/admin-events" className="800px:block hidden">
            <MdOutlineLocalOffer
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          <Link to="/admin-sellers" className="800px:block hidden">
            <GrWorkshop
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          <img
            src={user?.avatar}
            alt=""
            className="w-[50px] h-[50px] rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
