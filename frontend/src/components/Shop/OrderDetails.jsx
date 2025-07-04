import React, { useEffect, useState } from "react";
import { BsFillBagFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import io from "socket.io-client";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { getRequest, putRequest } from "../../request/api"; // Sử dụng getRequest từ api.js
import styles from "../../styles/styles";

const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:4000", {
  withCredentials: true,
});

const OrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [availableShippers, setAvailableShippers] = useState([]);
  const [showShipperModal, setShowShipperModal] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const cancelReasons = [
    "Out of stock or insufficient quantity",
    "Product quality not guaranteed",
    "Delivery area out of range",
    "System or technical error",
    "Other",
  ];

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));

    // Register seller with socket
    console.log(`Registering seller ${seller._id} with socket`);
    socket.emit("addUser", seller._id);

    // Listen for available shippers
    socket.on("availableShippers", ({ orderId, shippers }) => {
      if (orderId === id) {
        console.log(`Received availableShippers for order ${orderId}:`, shippers);
        setAvailableShippers(shippers);
      }
    });

    // Listen for order accepted by shipper
    socket.on("orderAcceptedByShipper", ({ orderId, shipper }) => {
      if (orderId === id) {
        console.log(`Received orderAcceptedByShipper for order ${orderId} with shipper ${shipper._id}`);
        setSelectedShipper(shipper);
        setShowShipperModal(true);
        toast.success("A shipper has accepted the order!");
        dispatch(getAllOrdersOfShop(seller._id)); // Refresh order list
      }
    });

    return () => {
      socket.off("availableShippers");
      socket.off("orderAcceptedByShipper");
    };
  }, [dispatch, seller._id, id]);

  const data = orders && orders.find((item) => item._id === id);
  const [selectedStatus, setSelectedStatus] = useState(data?.status || "");
  const [displayedStatus, setDisplayedStatus] = useState(data?.status || "");

  // Load shipper info if order has shipperId
  useEffect(() => {
    if (data?.shipperId && !selectedShipper) {
      const fetchShipperInfo = async () => {
        try {
          console.log(`Fetching shipper info for shipper ${data.shipperId}`);
          const res = await getRequest(`/shipper/get-shipper-info/${data.shipperId}`);
          if (res.code === -1) {
            console.error("Failed to fetch shipper info:", res.message);
            toast.error("Failed to load shipper information");
            return;
          }
          console.log(`Fetched shipper info for shipper ${data.shipperId}:`, res);
          setSelectedShipper(res);
        } catch (error) {
          console.error("Error fetching shipper info:", error.message);
          toast.error("Error loading shipper information");
        }
      };
      fetchShipperInfo();
    }
  }, [data?.shipperId]);

  const orderCancelHandler = async () => {
    if (!cancelReason) {
      toast.error("Please select a cancellation reason");
      return;
    }
    try {
      const res = await putRequest(`/order/cancel-order-by-seller/${id}`, {
        sellerCancelReason: cancelReason,
      });
      if (!res.success) {
        throw new Error(res.message || "Failed to cancel order");
      }
      toast.success("Order cancelled successfully!");
      setShowCancelModal(false);
      setCancelReason("");
      dispatch(getAllOrdersOfShop(seller._id));
      navigate("/dashboard-orders");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const orderUpdateHandler = async () => {
    try {
      const res = await putRequest(`/order/update-order-status/${id}`, {
        status: selectedStatus,
      });
      if (!res.success) {
        throw new Error(res.message || "Failed to update order status");
      }
      toast.success("Order status updated successfully!");
      setDisplayedStatus(selectedStatus);
      if (selectedStatus === "Contacting the delivery service") {
        socket.emit("findShippers", { orderId: id, ward: data?.shippingAddress?.ward });
      }
      dispatch(getAllOrdersOfShop(seller._id)); // Refresh order list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const refundOrderUpdateHandler = async () => {
    try {
      const res = await putRequest(`/order/order-refund-success/${id}`, {
        status: selectedStatus,
      });
      if (!res.success) {
        throw new Error(res.message || "Failed to update refund status");
      }
      toast.success("Refund status updated successfully!");
      setDisplayedStatus(selectedStatus);
      dispatch(getAllOrdersOfShop(seller._id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (data?.status) {
      setSelectedStatus(data.status);
      setDisplayedStatus(data.status);
    }
  }, [data?.status]);

  return (
    <div className={`py-4 min-h-screen ${styles.section}`}>
      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Select Cancellation Reason</h3>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border h-[40px] rounded-[5px] mb-4"
            >
              <option value="">Select a reason</option>
              {cancelReasons.map((reason, index) => (
                <option key={index} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-4">
              <button
                className={`${styles.button} px-4 py-2 bg-gray-300 text-gray-800 !h-[40px] !rounded-[4px] hover:bg-gray-400`}
                onClick={() => setShowCancelModal(false)}
              >
                Close
              </button>
              <button
                className={`${styles.button} !bg-[#f63b60] !rounded-[4px] text-white font-[600] !h-[40px] text-[16px]`}
                onClick={orderCancelHandler}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipper Acceptance Modal */}
      {showShipperModal && selectedShipper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Order Accepted by Shipper</h3>
            <p className="text-[16px]">
              <strong>Shipper Name:</strong> {selectedShipper.shipper.name || "Unknown"}
            </p>
            <p className="text-[16px]">
              <strong>Phone Number:</strong> {selectedShipper.shipper.phoneNumber || "Not specified"}
            </p>
            <p className="text-[16px]">
              <strong>Delivery Area:</strong>{" "}
              {selectedShipper.deliveredArea?.map((area) => area.ward).join(", ") || "Not specified"}
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className={`${styles.button} px-4 py-2 bg-gray-300 text-gray-800 !h-[40px] !rounded-[4px] hover:bg-gray-400`}
                onClick={() => setShowShipperModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header and Back Button */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <BsFillBagFill size={30} color="crimson" />
          <h1 className="pl-2 text-[25px] font-bold">Order Details</h1>
        </div>
        <Link to="/dashboard-orders">
          <div
            className={`${styles.button} !bg-[#f63b60] !rounded-[4px] text-white font-[600] !h-[45px] text-[18px]`}
          >
            Order List
          </div>
        </Link>
      </div>

      {/* Order Information */}
      <div className="w-full flex items-center justify-between pt-6">
        <h5 className="text-[#00000084]">
          Order ID: <span>#{data?._id?.slice(0, 8)}</span>
        </h5>
        <h5 className="text-[#00000084]">
          Placed On: <span>{data?.createdAt?.slice(0, 10)}</span>
        </h5>
      </div>

      {/* Order Items */}
      <br />
      <h4 className="text-[20px] font-[600]">Order Items</h4>
      <div className="w-full border-t pt-4">
        {data &&
          data?.cart.map((item, index) => (
            <div className="w-full flex items-start mb-5" key={index}>
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
        <div className="border-t w-full text-right pt-3">
          <h5 className="text-[18px] font-semibold">
            Total Price:{" "}
            <strong>{data?.totalPrice.toLocaleString("en-US")} VND</strong>
          </h5>
        </div>
      </div>

      {/* Shipping, Payment, and Cancel Button */}
      <br />
      <div className="w-full 800px:flex gap-6">
        {/* Shipping Information */}
        <div className="w-full 800px:w-[40%]">
          <h4 className="text-[20px] font-[600]">Shipping Information</h4>
          <div className="pt-3">
            <h5 className="text-[16px]">
              <strong>Recipient Name:</strong> {data?.user?.name || "Not specified"}
            </h5>
            <h5 className="text-[16px]">
              <strong>Phone Number:</strong> {data?.user?.phoneNumber || "Not specified"}
            </h5>
            <h5 className="text-[16px]">
              <strong>Address:</strong> {data?.shippingAddress.address1}
            </h5>
            <h5 className="text-[16px]">
              {data?.shippingAddress.ward}, {data?.shippingAddress.district},{" "}
              {data?.shippingAddress.province}
            </h5>
            {data?.refundReason && (
              <h5 className="text-[16px] pt-2">
                <strong>Refund Reason:</strong> {data?.refundReason}
              </h5>
            )}
            {data?.cancelReason && (
              <h5 className="text-[16px] pt-2">
                <strong>Buyer Cancel Reason:</strong> {data?.cancelReason}
              </h5>
            )}
            {data?.sellerCancelReason && (
              <h5 className="text-[16px] pt-2">
                <strong>Seller Cancel Reason:</strong> {data?.sellerCancelReason}
              </h5>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="w-full 800px:w-[30%]">
          <h4 className="text-[20px] font-[600]">Payment Information</h4>
          <div className="pt-3">
            <h5 className="text-[16px]">
              <strong>Status:</strong>{" "}
              {data?.paymentInfo?.status ? data?.paymentInfo?.status : "Not Paid"}
            </h5>
          </div>
        </div>

        {/* Cancel Order Button */}
        {data?.status === "Processing" && (
          <div className="w-full 800px:w-[30%] flex justify-end pt-3">
            <div
              className={`${styles.button} !bg-[#f63b60] !rounded-[4px] text-white font-[600] !h-[45px] text-[18px]`}
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Order
            </div>
          </div>
        )}
      </div>

      {/* Shipper Information */}
      {(data?.shipperId && selectedShipper && ["Transferred to delivery partner", "On the way", "Delivered"].includes(data?.status)) && (
        <div className="w-full mt-6">
          <h4 className="text-[20px] font-[600]">Shipper Information</h4>
          <div className="w-full pt-4">
            <div className="w-full bg-white rounded-md shadow-md p-6">
              <p className="text-[16px]">
                <strong>Shipper Name:</strong> {selectedShipper.shipper.name || "Unknown"}
              </p>
              <p className="text-[16px]">
                <strong>Phone Number:</strong> {selectedShipper.shipper.phoneNumber || "Not specified"}
              </p>
              <p className="text-[16px]">
                <strong>Delivery Area:</strong>{" "}
                {selectedShipper.shipper.deliveredArea?.map((area) => area.ward).join(", ") || "Not specified"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Available Shippers */}
      {data?.status === "Contacting the delivery service" && (
        <div className="w-full mt-6">
          <h4 className="text-[20px] font-[600]">Available Shippers</h4>
          {availableShippers.length === 0 ? (
            <p className="text-gray-600">No delivery person has accepted the order yet.</p>
          ) : (
            <div className="w-full pt-4">
              {availableShippers.map((shipper) => (
                <div
                  key={shipper._id}
                  className="w-full bg-white rounded-md shadow-md p-6 mb-4"
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-xs text-gray-600">
                          Shipper Name: {shipper.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Phone: {shipper.phoneNumber.slice(0, 3) + "****" + shipper.phoneNumber.slice(-3)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Delivery Area: {shipper.deliveredArea.map((area) => area.ward).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Status */}
      <br />
      <div className="w-full">
        <h4 className="text-[20px] font-[600]">Order Status</h4>
        <div className="flex items-center gap-4 pt-3">
          <div className="border border-gray-300 rounded-[5px] px-3 py-1 bg-gray-100 text-[16px]">
            {displayedStatus}
          </div>
          {data?.status === "Processing refund" && (
            <div>
              <h4 className="text-[16px] font-bold">{data?.refundReason}</h4>
            </div>
          )}
        </div>
        {data?.status !== "Cancelled" && data?.status !== "Cancelled by Seller" && (
          <div className="mt-4">
            {data?.status !== "Processing refund" &&
            data?.status !== "Refund Success" ? (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-[200px] border h-[35px] rounded-[5px]"
              >
                {[
                  "Processing",
                  "Confirmed",
                  "Packaging",
                  "Contacting the delivery service",
                  "Transferred to delivery partner",
                ]
                  .slice(
                    [
                      "Processing",
                      "Confirmed",
                      "Packaging",
                      "Contacting the delivery service",
                      "Transferred to delivery partner",
                    ].indexOf(data?.status)
                  )
                  .map((option, index) => (
                    <option value={option} key={index}>
                      {option}
                    </option>
                  ))}
              </select>
            ) : (
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
            )}
            <div
              className={`${styles.button} mt-5 !bg-[#16b12e] !rounded-[4px] text-white font-[600] !h-[45px] text-[18px]`}
              onClick={
                data?.status !== "Processing refund"
                  ? orderUpdateHandler
                  : refundOrderUpdateHandler
              }
            >
              Update Status
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;