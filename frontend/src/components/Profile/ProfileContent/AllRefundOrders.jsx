import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfUser } from "../../../redux/actions/order";
import {
  AiOutlineArrowRight,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
} from "react-icons/ai";

const AllRefundOrders = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user._id]);

  // Toggle product display
  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Define status filters
  const statusFilters = {
    all: {
      label: "All Refund Orders",
      icon: <AiOutlineClockCircle />,
      statuses: [],
    },
    processing: {
      label: "Processing Refund",
      icon: <AiOutlineClockCircle />,
      statuses: ["Processing refund"],
    },
    success: {
      label: "Refund Success",
      icon: <AiOutlineCheckCircle />,
      statuses: ["Refund Success"],
    },
  };

  // Filter orders based on status
  const filteredOrders = orders
    ? filterStatus === "all"
      ? orders.filter((order) =>
          ["Processing refund", "Refund Success"].includes(order.status)
        )
      : orders.filter((order) =>
          statusFilters[filterStatus].statuses.includes(order.status)
        )
    : [];

  // Sort orders by createdAt descending
  const sortedOrders = filteredOrders.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="w-full p-8">
      <h2 className="text-2xl font-bold mb-4">All Refund Orders</h2>
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
        <p className="text-gray-600">No refund orders found.</p>
      ) : (
        sortedOrders.map((order) => (
          <div
            key={order._id}
            className="w-full bg-white rounded-md shadow-md p-6 mb-4"
          >
            <div className="flex flex-col">
              {/* Shop name */}
              <h4 className="text-sm font-semibold text-[#f63b60] mb-2">
                {order.cart[0]?.shop?.name || "Unknown Shop"}
              </h4>
              {/* Product display */}
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
                          Price:{" "}
                          {(item.discountPrice * item.qty).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VNĐ
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
              {/* Status and total */}
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`font-bold ${
                    order.status === "Refund Success"
                      ? "text-green-600"
                      : "text-yellow-500"
                  }`}
                >
                  Status: {order.status}
                </span>
                <span className="text-sm font-semibold">
                  Total: {order.totalPrice.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
              {/* Details button */}
              <div className="flex justify-end">
                <a
                  href={`/user/order/${order._id}`}
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
    </div>
  );
};

export default AllRefundOrders;
