import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";
import { toast } from "react-toastify";
import { getRequest } from "../../request/api"; // Import getRequest từ api.js

const ShipperInfo = ({ isOwner }) => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    setIsLoading(true);
    getRequest(`/shipper/get-shipper-info/${id}`)
      .then((res) => {
        if (!res.success) {
          throw new Error(res.message || "Failed to fetch shipper info");
        }
        setData(res.shipper);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  const logoutHandler = async () => {
    try {
      const refreshToken = localStorage.getItem("shipper_refreshToken");
      const res = await getRequest("/shipper/logout", { refreshToken });
      if (!res.success) {
        throw new Error(res.message || "Failed to logout");
      }
      toast.success("Logout Success!");
      localStorage.removeItem("shipper_accessToken");
      localStorage.removeItem("shipper_refreshToken");
      navigate("/shipper-login");
      window.location.reload(true);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="w-full py-5">
            <div className="w-full flex item-center justify-center">
              <img
                src={data.avatar}
                alt=""
                className="w-[150px] h-[150px] object-cover rounded-full"
              />
            </div>
            <h3 className="text-center py-2 text-[20px]">{data.name}</h3>
            <p className="text-[16px] text-[#000000a6] p-[10px] flex items-center">
              {data.description}
            </p>
          </div>
          <div className="p-3">
            <h5 className="font-[600]">Address</h5>
            <h4 className="text-[#000000a6]">{data.address}</h4>
          </div>
          <div className="p-3">
            <h5 className="font-[600]">Phone Number</h5>
            <h4 className="text-[#000000a6]">{data.phoneNumber}</h4>
          </div>
          <div className="p-3">
            <h5 className="font-[600]">Total Orders</h5>
            {/* <h4 className="text-[#000000a6]">{orders && orders.length}</h4> */}
          </div>
          <div className="p-3">
            <h5 className="font-[600]">Joined On</h5>
            <h4 className="text-[#000000b0]">
              {data?.createdAt?.slice(0, 10)}
            </h4>
          </div>
          {isOwner && (
            <div className="py-3 px-4">
              <Link to="/shipper-settings">
                <div
                  className={`${styles.button} !w-full !h-[42px] !rounded-[5px]`}
                >
                  <span className="text-white">Edit Shipper Info</span>
                </div>
              </Link>

              <Link to="/shipper-dashboard">
                <div
                  className={`${styles.button} !w-full !h-[42px] !rounded-[5px]`}
                >
                  <span className="text-[#fff]">Go Dashboard</span>
                </div>
              </Link>

              <div
                className={`${styles.button} !w-full !h-[42px] !rounded-[5px]`}
                onClick={logoutHandler}
              >
                <span className="text-white">Log Out</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ShipperInfo;