import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import { BsFillBagFill } from "react-icons/bs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { backend_url, server } from "../../server";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-ui/core";

const OrderStatus = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch]);

  const data = orders && orders.find((item) => item._id === id);
  // State cho dropdown (giá trị tạm thời khi chọn)
  const [selectedStatus, setSelectedStatus] = useState(data?.status || "");
  // State cho thẻ hiển thị trạng thái (chỉ cập nhật sau khi nhấn Update Status)
  const [displayedStatus, setDisplayedStatus] = useState(data?.status || "");

  const orderCancelHandler = async () => {
    await axios
      .put(`${server}/order/delete-order/${id}`, { withCredentials: true })
      .then((res) => {
        toast.success("Order canceled!");
        navigate("/dashboard-orders");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const orderUpdateHandler = async () => {
    try {
      await axios.put(
        `${server}/order/update-order-status/${id}`,
        {
          status: selectedStatus,
        },
        { withCredentials: true }
      );
      toast.success("Order updated!");
      setDisplayedStatus(selectedStatus); // Cập nhật thẻ hiển thị
      navigate("/dashboard-orders");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const refundOrderUpdateHandler = async () => {
    try {
      await axios.put(
        `${server}/order/order-refund-success/${id}`,
        {
          status: selectedStatus,
        },
        { withCredentials: true }
      );
      toast.success("Order updated!");
      setDisplayedStatus(selectedStatus); // Cập nhật thẻ hiển thị
      dispatch(getAllOrdersOfShop(seller._id));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // Đồng bộ state khi data thay đổi
  useEffect(() => {
    if (data?.status) {
      setSelectedStatus(data.status);
      setDisplayedStatus(data.status);
    }
  }, [data?.status]);

  return (
    <div className={`py-4 min-h-screen ${styles.section}`}>
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <BsFillBagFill size={30} color="crimson" />
          <h1 className="pl-2 text-[25px]">Order Details</h1>
        </div>
        <Link to="/dashboard-orders">
          <div
            className={`${styles.button} !bg-[#fce1e6] !rounded-[4px] text-[#e94560] font-[600] !h-[45px] text-[18px]`}
          >
            Order List
          </div>
        </Link>
      </div>

      <div className="w-full flex items-center justify-between pt-6">
        <h5 className="text-[#00000084]">
          order ID: <span>#{data?._id?.slice(0, 8)}</span>
        </h5>
        <h5 className="text-[#00000084]">
          Placed On: <span>{data?.createdAt?.slice(0, 10)}</span>
        </h5>
      </div>

      {/* Order Items */}
      <br />
      <br />
      <div className="w-full flex justify-between">
        {data &&
          data?.cart.map((item, index) => (
            <div className="w-full flex items-start mb-5" key={index}>
              <img
                src={`${backend_url}/${item.images[0]}`}
                alt="Product item order img"
                className="w-[80px] h-[80px]"
              />
              <div className="w-full">
                <h5 className="pl-3 text-[20px]">{item.name}</h5>
                <h5 className="pl-3 text-[20px] text-[#00000091]">
                  {item.discountPrice.toLocaleString("vi-VN") + " VNĐ"} x{" "}
                  {item.qty}
                </h5>
              </div>
            </div>
          ))}
        <div
          className={`${styles.button} !bg-[#FCE1E6] !rounded-[4px] text-[#E94560] font-[600] !h-[45px] text-[18px]`}
          onClick={orderCancelHandler}
        >
          Cancel Order
        </div>
      </div>
      <div className="border-t w-full text-right">
        <h5>
          Total Price:{" "}
          <strong>{data?.totalPrice.toLocaleString("vi-VN") + " VNĐ"}</strong>
        </h5>
      </div>
      <br />
      <br />

      {/* Shipping Address */}
      <div className="w-full 800px:flex items-center">
        <div className="w-full 800px:w-[60%]">
          <h4 className="pt-3 text-[20px] font-[600]">Shipping Address:</h4>
          <h4 className="pt-3 text-[20px]">{data?.shippingAddress.address1}</h4>
          <h4 className="text-[20px]">
            {data?.shippingAddress.ward}, {data?.shippingAddress.district},{" "}
            {data?.shippingAddress.province}
          </h4>
          <h4 className="text-[20px]">{data?.user?.phoneNumber}</h4>
        </div>

        <div className="w-full 800px:w-[40%]">
          <h4 className="pt-3 text-[20px]">Payment Info:</h4>
          <h4>
            Status:{" "}
            {data?.paymentInfo?.status ? data?.paymentInfo?.status : "Not Paid"}
          </h4>
        </div>
      </div>
      <br />
      <br />

      {/* Order Status */}
      <div className="flex items-center gap-4">
        <h4 className="pt-3 text-[20px] font-[600]">Order status:</h4>
        <div className="border border-gray-300 rounded-[5px] px-3 py-1 bg-gray-100 text-[16px]">
          {displayedStatus}
        </div>
      </div>
      <div className="mt-2">
        {data?.status !== "Processing refund" &&
          data?.status !== "Refund Success" && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-[200px] border h-[35px] rounded-[5px]"
            >
              {[
                "Processing",
                "Transferred to delivery partner",
                "Shipping",
                "Received",
                "On the way",
                "Delivered",
              ]
                .slice(
                  [
                    "Processing",
                    "Transferred to delivery partner",
                    "Shipping",
                    "Received",
                    "On the way",
                    "Delivered",
                  ].indexOf(data?.status)
                )
                .map((option, index) => (
                  <option value={option} key={index}>
                    {option}
                  </option>
                ))}
            </select>
          )}

        {data?.status === "Processing refund" ||
        data?.status === "Refund Success" ? (
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-[200px] border h-[35px] rounded-[5px]"
          >
            {["Processing refund", "Refund Success"]
              .slice(
                ["Processing refund", "Refund Success"].indexOf(data?.status)
              )
              .map((option, index) => (
                <option value={option} key={index}>
                  {option}
                </option>
              ))}
          </select>
        ) : null}

        <div
          className={`${styles.button} mt-5 !bg-[#c7e9cc] !rounded-[4px] text-[#E94560] font-[600] !h-[45px] text-[18px]`}
          onClick={
            data?.status !== "Processing refund"
              ? orderUpdateHandler
              : refundOrderUpdateHandler
          }
        >
          Update Status
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
