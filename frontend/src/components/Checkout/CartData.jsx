import React from "react";
import styles from "../../styles/styles";

const CartData = ({
  handleSubmit,
  totalPrice,
  shipping,
  subTotalPrice,
  couponCode,
  setCouponCode,
  discountPercentenge,
  availableCoupons,
  isLoadingCoupons,
  cart,
}) => {
  const selectedCoupon = availableCoupons.find(
    (coupon) => coupon.name === couponCode
  );

  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      <h3 className="text-[18px] font-[500] mb-4">Cart Items</h3>
      {cart.map((item, index) => (
        <div key={index} className="flex items-center mb-4 border-b pb-4">
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-[80px] h-[80px] object-cover rounded-md mr-4"
          />
          <div className="flex-1">
            <h4 className="text-[14px] font-[500]">{item.name}</h4>
            <p className="text-[12px] text-gray-600">
              Quantity: {item.qty}
            </p>
            <p className="text-[12px] text-gray-600">
              Price: {(item.discountPrice * item.qty).toLocaleString("vi-VN")} VNĐ
            </p>
          </div>
        </div>
      ))}
      <div className="flex justify-between">
        <h3 className="text-[16x] font-[400] text-[#000000a4]">Subtotal:</h3>
        <h5 className="text-[18px] font-[600]">
          {subTotalPrice.toLocaleString("vi-VN")} VNĐ
        </h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Shipping:</h3>
        <h5 className="text-[18px] font-[600]">
          {shipping.toLocaleString("vi-VN")} VNĐ
        </h5>
      </div>
      <br />
      <div className="flex justify-between border-b pb-3">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
        <h5 className="text-[18px] font-[600]">
          -{" "}
          {discountPercentenge
            ? discountPercentenge.toLocaleString("vi-VN") + " VNĐ"
            : null}
        </h5>
      </div>
      <h5 className="text-[18px] font-[600] text-end pt-3">
        {totalPrice.toLocaleString("vi-VN")} VNĐ
      </h5>
      <br />
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-[14px] font-[500] mb-2">
            Select Coupon:
          </label>
          {isLoadingCoupons ? (
            <div className="h-[40px] flex items-center justify-center">
              <span>Loading coupons...</span>
            </div>
          ) : (
            <select
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className={`${styles.input} h-[40px] pl-2 w-full`}
              required
            >
              <option value="">Select a coupon</option>
              {availableCoupons.map((coupon) => (
                <option key={coupon.name} value={coupon.name}>
                  {coupon.name} -{" "}
                  {coupon.discountType === "percentage"
                    ? `${coupon.value}% off`
                    : `${coupon.value.toLocaleString("vi-VN")} VNĐ off`}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedCoupon && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h4 className="text-[14px] font-[600] mb-1">
              {selectedCoupon.name}
            </h4>
            <p className="text-[12px] text-gray-600">
              {selectedCoupon.discountType === "percentage"
                ? `${selectedCoupon.value}% discount`
                : `${selectedCoupon.value.toLocaleString("vi-VN")} VNĐ discount`}
            </p>
            {selectedCoupon.minAmount && (
              <p className="text-[12px] text-gray-600">
                Min. order: {selectedCoupon.minAmount.toLocaleString("vi-VN")} VNĐ
              </p>
            )}
            {selectedCoupon.endDate && (
              <p className="text-[12px] text-gray-600">
                Valid until: {new Date(selectedCoupon.endDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <input
          className="w-full h-[40px] border border-[#f63b60] text-center text-[#f63b60] rounded-[3px] mt-8 cursor-pointer"
          required
          value="Apply code"
          type="submit"
        />
      </form>
    </div>
  );
};

export default CartData;