import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import Loader from "../Layout/Loader";

const AllOrders = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [expandedOrders, setExpandedOrders] = useState({}); // State để toggle "Xem thêm"

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch, seller._id]);

  // Hàm toggle hiển thị sản phẩm
  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Sắp xếp đơn hàng theo createdAt giảm dần
  const sortedOrders = orders
    ? [...orders].sort((a, b) => new Date(b.createdAt.$date) - new Date(a.createdAt.$date))
    : [];

  console.log("Sorted Orders:", sortedOrders);

  return (
    <div className="w-full p-8">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">All Orders</h2>
          {sortedOrders.length === 0 ? (
            <p className="text-gray-600">No orders found.</p>
          ) : (
            sortedOrders.map((order) => (
              <div
                key={order._id}
                className="w-full bg-white rounded-md shadow-md p-6 mb-4"
              >
                <div className="flex flex-col">
                  {/* Hiển thị sản phẩm */}
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
                              Price: {(item.discountPrice * item.qty).toLocaleString("vi-VN")} VNĐ
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
                  {/* Tên người nhận, trạng thái và tổng tiền */}
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
                      Recipient Name: {order.user?.name || "Unknown Recipient Name"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      Total: {order.totalPrice.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                  {/* Nút chi tiết */}
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