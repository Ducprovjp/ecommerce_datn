import React, { useEffect, useState } from "react";
import styles from "../styles/styles";
import { BsFillBagFill } from "react-icons/bs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { putRequest } from "../request/api";
import { RxCross1 } from "react-icons/rx";
import { getAllOrdersOfUser } from "../redux/actions/order";
import { useDispatch, useSelector } from "react-redux";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

const UserOrderDetails = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(1);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false); // State cho modal hủy đơn
  const [cancelReason, setCancelReason] = useState(""); // State cho lý do hủy

  const { id } = useParams();

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user._id]);

  const data = orders && orders.find((item) => item._id === id);

  const navigate = useNavigate();
  const handleGoToOrders = () => {
    navigate("/profile");
  };

  const reviewHandler = async (type) => {
    try {
      const endpoint =
        type === "product"
          ? "/product/create-new-review"
          : "/event/create-new-review-event";

      const response = await putRequest(endpoint, {
        user,
        rating,
        comment,
        productId: selectedItem?._id,
        orderId: id,
      });

      if (!response.success) {
        toast.error(response.message || "Failed to submit review");
        return;
      }

      toast.success(response.message);
      dispatch(getAllOrdersOfUser(user._id));
      setComment("");
      setRating(null);
      setOpen(false);
    } catch (error) {
      console.error("Review error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  // const combinedHandler = async () => {
  //   if (rating > 1) {
  //     await reviewHandler("product");
  //     await reviewHandler("event");
  //   }
  // };

  const combinedHandler = async () => {
    if (rating > 1) {
      // Kiểm tra xem selectedItem có phải là sự kiện không
      const isEvent = selectedItem?.type === "event" || selectedItem?.eventId;

      if (isEvent) {
        await reviewHandler("event"); // Đánh giá sự kiện
      } else {
        await reviewHandler("product"); // Đánh giá sản phẩm
      }
    }
  };

  const refundHandler = async () => {
    try {
      const response = await putRequest(`/order/order-refund/${id}`, {
        status: "Processing refund",
        refundReason,
      });

      if (!response.success) {
        toast.error(response.message || "Failed to request refund");
        return;
      }

      toast.success(response.message);
      dispatch(getAllOrdersOfUser(user._id));
      setRefundModalOpen(false);
      setRefundReason("");
    } catch (error) {
      console.error("Refund error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const cancelHandler = async () => {
    try {
      const response = await putRequest(`/order/order-cancel/${id}`, {
        status: "Cancelled",
        cancelReason,
      });

      if (!response.success) {
        toast.error(response.message || "Failed to cancel order");
        return;
      }

      toast.success(response.message);
      dispatch(getAllOrdersOfUser(user._id));
      setCancelModalOpen(false);
      setCancelReason("");
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className={`mx-3 py-4 min-h-screen ${styles.section}`}>
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <BsFillBagFill size={30} color="crimson" />
          <h1 className="pl-2 text-[25px]">Order Details</h1>
        </div>
        <button
          onClick={handleGoToOrders}
          className={`${styles.button} !bg-[#f63b60] font-[600] !h-[45px] text-[18px]`}
        >
          Order List
        </button>
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
      {data &&
        data?.cart.map((item, index) => (
          <div className="w-full flex items-start mb-5" key={index}>
            <img
              src={item.images[0]}
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
            {!item.isReviewed && data?.status === "Delivered" ? (
              <div
                className={`${styles.button} text-[#fff]`}
                onClick={() => {
                  setOpen(true);
                  setSelectedItem(item);
                }}
              >
                Write a review
              </div>
            ) : null}
          </div>
        ))}

      {/* Review Popup */}
      {open && (
        <div className="w-full fixed top-0 left-0 h-screen bg-[#0005] z-50 flex items-center justify-center">
          <div className="w-[50%] h-min bg-[#fff] shadow rounded-md p-3">
            <div className="w-full flex justify-end p-3">
              <RxCross1
                size={30}
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              />
            </div>
            <h2 className="text-[30px] font-[500] font-Poppins text-center">
              Give a Review
            </h2>
            <br />
            <div className="w-full flex">
              <img
                src={selectedItem?.images[0]}
                alt=""
                className="w-[80px] h-[80px]"
              />
              <div>
                <div className="pl-3 text-[20px]">{selectedItem?.name}</div>
                <h4 className="pl-3 text-[20px]">
                  {selectedItem?.discountPrice.toLocaleString("vi-VN") + " VNĐ"}{" "}
                  x {selectedItem?.qty}
                </h4>
              </div>
            </div>

            <br />
            <br />

            {/* Rating */}
            <h5 className="pl-3 text-[20px] font-[500]">
              Give a Rating <span className="text-red-500">*</span>
            </h5>
            <div className="flex w-fit ml-2 pt-1">
              {[1, 2, 3, 4, 5].map((i) =>
                rating >= i ? (
                  <AiFillStar
                    key={i}
                    className="mr-1 cursor-pointer"
                    color="rgb(246,186,0)"
                    size={25}
                    onClick={() => setRating(i)}
                  />
                ) : (
                  <AiOutlineStar
                    key={i}
                    className="mr-1 cursor-pointer"
                    color="rgb(246,186,0)"
                    size={25}
                    onClick={() => setRating(i)}
                  />
                )
              )}
            </div>
            <br />
            {/* Comment */}
            <div className="w-full ml-3">
              <label className="block text-[20px] font-[500]">
                Write a Comment
                <span className="ml-1 font-[400] text-[16px] text-[#00000052]">
                  (Optional)
                </span>
              </label>
              <textarea
                name="comment"
                cols="20"
                rows="5"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your product? Write your expression about it!"
                className="mt-2 w-[95%] border p-2 outline-none"
              ></textarea>
            </div>
            <div
              className={`${styles.button} text-white text-[20px] ml-3`}
              onClick={rating > 1 ? combinedHandler : null}
            >
              Submit
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="w-full fixed top-0 left-0 h-screen bg-[#0005] z-50 flex items-center justify-center">
          <div className="w-[50%] h-min bg-[#fff] shadow rounded-md p-3">
            <div className="w-full flex justify-end p-3">
              <RxCross1
                size={30}
                onClick={() => setRefundModalOpen(false)}
                className="cursor-pointer"
              />
            </div>
            <h2 className="text-[30px] font-[500] font-Poppins text-center">
              Request Refund
            </h2>
            <br />
            <div className="w-full ml-3">
              <label className="block text-[20px] font-[500]">
                Reason for Refund <span className="text-red-500">*</span>
              </label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="mt-2 w-[95%] border p-2 outline-none"
              >
                <option value="">Select a reason</option>
                <option value="Hàng có vấn đề (bể, vỡ, sai màu, hàng lỗi,...)">
                  هàng có vấn đề (bể, vỡ, sai màu, hàng lỗi,...)
                </option>
                <option value="Chưa nhận được hàng/nhận thiếu hàng">
                  Chưa nhận được hàng/nhận thiếu hàng
                </option>
              </select>
            </div>
            <div
              className={`${styles.button} text-white text-[20px] ml-3 mt-4`}
              onClick={refundReason ? refundHandler : null}
            >
              Submit
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="w-full fixed top-0 left-0 h-screen bg-[#0005] z-50 flex items-center justify-center">
          <div className="w-[50%] h-min bg-[#fff] shadow rounded-md p-3">
            <div className="w-full flex justify-end p-3">
              <RxCross1
                size={30}
                onClick={() => setCancelModalOpen(false)}
                className="cursor-pointer"
              />
            </div>
            <h2 className="text-[30px] font-[500] font-Poppins text-center">
              Cancel Order
            </h2>
            <br />
            <div className="w-full ml-3">
              <label className="block text-[20px] font-[500]">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt Horner điều khiển
                mt-2 w-[95%] border p-2 outline-none"
              >
                <option value="">Select a reason</option>
                <option value="Tôi muốn cập nhật địa chỉ, số điện thoại nhận hàng">
                  Tôi muốn cập nhật địa chỉ, số điện thoại nhận hàng
                </option>
                <option value="Người bán không trả lời thắc mắc, yêu cầu của tôi">
                  Người bán không trả lời thắc mắc, yêu cầu của tôi
                </option>
                <option value="Thay đổi đơn hàng (màu sắc, kích thước, thêm mã giảm giá,...)">
                  Thay đổi đơn hàng (màu sắc, kích thước, thêm mã giảm giá,...)
                </option>
                <option value="Lý do khác">Lý do khác</option>
              </select>
            </div>
            <div
              className={`${styles.button} text-white text-[20px] ml-3 mt-4`}
              onClick={cancelReason ? cancelHandler : null}
            >
              Submit
            </div>
          </div>
        </div>
      )}

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
          <div>
            <h4 className="pt-3 text-[20px] font-[600]">Shipping Address:</h4>
            <h4 className="pt-3 text-[20px]">
              {data?.shippingAddress.address1}
            </h4>
            <h4 className="text-[20px]">
              {data?.shippingAddress.ward}, {data?.shippingAddress.district},{" "}
              {data?.shippingAddress.province}
            </h4>
            <h4 className="text-[20px]">{data?.user?.phoneNumber}</h4>
          </div>
          <div>
            {data?.refundReason && (
              <h4 className="mt-3 text-[20px] font-[600]">
                Refund Reason: {data?.refundReason}
              </h4>
            )}
            {data?.cancelReason && (
              <h4 className="mt-3 text-[20px] font-[600]">
                Cancel Reason: {data?.cancelReason}
              </h4>
            )}
          </div>
        </div>

        <div className="w-full 800px:w-[40%]">
          <h4 className="pt-3 text-[20px] font-[600]">Payment Info:</h4>
          <h4>
            Status:{" "}
            {data?.paymentInfo?.status ? data?.paymentInfo?.status : "Not Paid"}
          </h4>
          <br />
          {data?.status === "Delivered" ? (
            <div
              className={`${styles.button} text-white`}
              onClick={() => setRefundModalOpen(true)}
            >
              Return order/Refund
            </div>
          ) : data?.status === "Processing" || data?.status === "Packaging" ? (
            <div
              className={`${styles.button} text-white`}
              onClick={() => setCancelModalOpen(true)}
            >
              Cancel Order
            </div>
          ) : null}
        </div>
      </div>
      <br />

      <Link to="/inbox">
        <div className={`${styles.button} text-white`}>Send Message</div>
      </Link>
      <br />
      <br />
    </div>
  );
};

export default UserOrderDetails;
