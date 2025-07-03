import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight, AiOutlineCheckCircle, AiOutlineClockCircle, AiOutlineGift } from "react-icons/ai";
import { FaCheckCircle, FaMoneyCheckAlt, FaTruck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import Loader from "../Layout/Loader";

const AllOrders = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch, seller._id]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Define status filters
  const statusFilters = {
    all: { label: "All Orders", icon: <AiOutlineClockCircle />, statuses: [] },
    pending: { label: "Pending Confirmation", icon: <AiOutlineClockCircle />, statuses: ["Processing"] },
    awaitingPickup: {
      label: "Awaiting Pickup",
      icon: <AiOutlineGift />,
      statuses: ["Confirmed", "Packaging", "Contacting the delivery service", "Transferred to delivery partner"],
    },
    shipping: { label: "Shipping", icon: <FaTruck />, statuses: ["On the way"] },
    delivered: { label: "Delivered", icon: <AiOutlineCheckCircle />, statuses: ["Delivered"] },
    refundProcessing: { label: "Refund Requested", icon: <FaMoneyCheckAlt />, statuses: ["Processing refund"] },
    refundSuccess: { label: "Refund Successful", icon: <FaCheckCircle />, statuses: ["Refund Success"] },
  };

  // Filter orders based on status
  const filteredOrders = orders
    ? filterStatus === "all"
      ? [...orders]
      : [...orders].filter((order) => statusFilters[filterStatus].statuses.includes(order.status))
    : [];

  // Sort orders by createdAt in descending order
  const sortedOrders = filteredOrders.sort((a, b) => new Date(b.createdAt.$date) - new Date(a.createdAt.$date));

  console.log("Sorted Orders:", sortedOrders);

  return (
    <div className="w-full p-8">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">All Orders</h2>
          {/* Filter Buttons */}
          <div className="flex gap-4 mb-6 overflow-x-auto">
            {Object.keys(statusFilters).map((key) => (
              <button
                key={key}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  filterStatus === key
                    ? "bg-[#f63b60] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setFilterStatus(key)}
              >
                {statusFilters[key].icon}
                <span className="ml-2">{statusFilters[key].label}</span>
              </button>
            ))}
          </div>
          {sortedOrders.length === 0 ? (
            <p className="text-gray-600">No orders found.</p>
          ) : (
            sortedOrders.map((order) => (
              <div
                key={order._id}
                className="w-full bg-white rounded-md shadow-md p-6 mb-4"
              >
                <div className="flex flex-col">
                  {/* Display products */}
                  <div className="mb-4">
                    {order.cart
                      .slice(0, expandedOrders[order._id] ? undefined : 1)
                      .map((item, index) => (
                        <div key={index} className="flex items-center mb-4">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-md mr-4"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{item.name}</h4>
                            <p className="text-xs text-gray-600">
                              Quantity: {item.qty}
                            </p>
                            <p className="text-xs text-gray-600">
                              Price: {(item.discountPrice * item.qty).toLocaleString("vi-VN")} VND
                            </p>
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
                  {/* Recipient name, status, and total price */}
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
                      <p className="text-xs text-gray-600 mt-1">
                        Recipient Name: {order.user?.name || "Unknown"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      Total: {order.totalPrice.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                  {/* Details button */}
                  <div className="flex justify-end">
                    <a
                      href={`/order/${order._id}`}
                      className="flex items-center bg-[#f63b60] text-white px-4 py-2 rounded-md hover:bg-[#e12c4f]"
                    >
                      View Details
                      <AiOutlineArrowRight className="ml-2" size={20} />
                    </a>
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