import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { BsFillBagFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import io from "socket.io-client";
import { getAllOrdersOfShipper } from "../../redux/actions/order";
import { putRequest } from "../../request/api";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";

const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:4000", {
  withCredentials: true,
});

const AllOrders = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { shipper } = useSelector((state) => state.shipper);
  const dispatch = useDispatch();
  const [expandedOrders, setExpandedOrders] = useState({});
  const [availableOrders, setAvailableOrders] = useState(orders || []);

  useEffect(() => {
    dispatch(getAllOrdersOfShipper(shipper._id)).catch((error) => {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    });

    // Join socket as shipper
    socket.emit("addUser", shipper._id);

    // Listen for new orders
    socket.on("newOrderAvailable", (order) => {
      console.log("New order received:", order);
      setAvailableOrders((prev) => {
        // Avoid duplicates
        if (!prev.some((o) => o._id === order._id)) {
          return [...prev, order];
        }
        return prev;
      });
      toast.info("New order available in your delivery area!");
    });

    // Listen for order acceptance by another shipper
    socket.on("orderAccepted", ({ orderId }) => {
      setAvailableOrders((prev) => prev.filter((order) => order._id !== orderId));
      toast.info("An order was accepted by another shipper.");
    });

    return () => {
      socket.off("newOrderAvailable");
      socket.off("orderAccepted");
    };
  }, [dispatch, shipper._id]);

  useEffect(() => {
    setAvailableOrders(orders || []);
  }, [orders]);

  const handleAcceptOrder = async (orderId) => {
    try {
      const res = await putRequest(`/order/accept-order/${orderId}`, { shipperId: shipper._id });
      if (!res.success) {
        throw new Error(res.message || "Failed to accept order");
      }
      toast.success("Order accepted successfully!");
      socket.emit("orderAccepted", { orderId, shipperId: shipper._id });
      dispatch(getAllOrdersOfShipper(shipper._id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const maskPhoneNumber = (phone) => {
    if (!phone) return "Not specified";
    return phone.slice(0, 3) + "****" + phone.slice(-3);
  };

  // Sort orders by createdAt in descending order
  const sortedOrders = availableOrders
    ? [...availableOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  return (
    <div className={`py-4 min-h-screen ${styles.section}`}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center">
              <BsFillBagFill size={30} color="crimson" />
              <h1 className="pl-2 text-[25px] font-bold">All Orders</h1>
            </div>
          </div>
          <br />
          {sortedOrders.length === 0 ? (
            <p className="text-gray-600">No orders found.</p>
          ) : (
            sortedOrders.map((order) => (
              <div
                key={order._id}
                className="w-full bg-white rounded-md shadow-md p-6 mb-4"
              >
                <div className="w-full flex items-center justify-between pt-6">
                  <h5 className="text-[#00000084]">
                    Order ID: <span>#{order._id.slice(0, 8)}</span>
                  </h5>
                </div>
                <div className="flex flex-col">
                  {/* Order Items */}
                  <div className="mb-4">
                    {order.cart
                      .slice(0, expandedOrders[order._id] ? undefined : 1)
                      .map((item, index) => (
                        <div key={index} className="w-full flex items-start mb-5">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-[80px] h-[80px] object-cover rounded-md"
                          />
                          <div className="w-full pl-3">
                            <h5 className="text-[20px] font-medium">{item.name}</h5>
                            <h5 className="text-[16px] text-[#00000091]">
                              {item.discountPrice.toLocaleString("en-US")} VND x {item.qty} ={" "}
                              {(item.discountPrice * item.qty).toLocaleString("en-US")} VND
                            </h5>
                          </div>
                        </div>
                      ))}
                    {order.cart.length > 1 && (
                      <button
                        className="text-blue-600 text-sm font-medium hover:underline"
                        onClick={() => toggleExpand(order._id)}
                      >
                        {expandedOrders[order._id] ? "Show Less" : "View More"}
                      </button>
                    )}
                  </div>
                  {/* Order Info */}
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span
                        className={`font-bold ${
                          ["Delivered", "Refund Success"].includes(order.status)
                            ? "text-green-600"
                            : "text-yellow-500"
                        }`}
                      >
                        Status: {order.status}
                      </span>
                      <p className="text-[16px]">
                        <strong>Recipient Name:</strong> {order.user?.name || "Not specified"}
                      </p>
                      <p className="text-[16px]">
                        <strong>Pickup Address:</strong> {order.shopAddress?.address1 || "Not specified"}, {order.shopAddress?.ward || ""}, {order.shopAddress?.district || ""}, {order.shopAddress?.province || ""}
                      </p>
                      <p className="text-[16px]">
                        <strong>Delivery Address:</strong> {order.shippingAddress?.address1 || "Not specified"}, {order.shippingAddress?.ward || ""}, {order.shippingAddress?.district || ""}, {order.shippingAddress?.province || ""}
                      </p>
                      <p className="text-[16px]">
                        <strong>Sender:</strong> {order.cart[0]?.shopName || "Not specified"} ({maskPhoneNumber(order.cart[0]?.shopPhone)})
                      </p>
                      <p className="text-[16px]">
                        <strong>Receiver:</strong> {order.user?.name || "Not specified"} ({maskPhoneNumber(order.user?.phoneNumber)})
                      </p>
                    </div>
                    <span className="text-[18px] font-semibold">
                      Total: {order.totalPrice.toLocaleString("en-US")} VND / 30,000 VND
                    </span>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex justify-end">
                    {order.status === "Contacting the delivery service" && !order.shipperId ? (
                      <div
                        className={`${styles.button} !bg-[#16b12e] !rounded-[4px] text-white font-[600] !h-[45px] text-[18px]`}
                        onClick={() => handleAcceptOrder(order._id)}
                      >
                        Confirm Accept
                      </div>
                    ) : order.status === "Transferred to delivery partner" && order.shipperId.toString() === shipper._id ? (
                      <a
                        href={`/shipper/order/${order._id}`}
                        className={`${styles.button} !bg-[#f63b60] !rounded-[4px] text-white font-[600] !h-[45px] text-[18px]`}
                      >
                        View Details
                        <AiOutlineArrowRight className="ml-2" size={20} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default AllOrders;