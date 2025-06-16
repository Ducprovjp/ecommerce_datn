import React from "react";
import styles from "../../styles/styles";

const CartData = ({ orderData }) => {
  const shipping = orderData?.shipping
    ? orderData.shipping.toLocaleString("vi-VN") + " VNĐ"
    : "0 VNĐ";

  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      <h3 className="text-[18px] font-[500] mb-4">Cart Items</h3>
      {orderData?.cart?.map((item, index) => (
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
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Subtotal:</h3>
        <h5 className="text-[18px] font-[600]">
          {orderData?.subTotalPrice
            ? orderData.subTotalPrice.toLocaleString("vi-VN") + " VNĐ"
            : "0 VNĐ"}
        </h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Shipping:</h3>
        <h5 className="text-[18px] font-[600]">{shipping}</h5>
      </div>
      <br />
      <div className="flex justify-between border-b pb-3">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
        <h5 className="text-[18px] font-[600]">
          {orderData?.discountPrice
            ? "- " + orderData.discountPrice.toLocaleString("vi-VN") + " VNĐ"
            : "0 VNĐ"}
        </h5>
      </div>
      <h5 className="text-[18px] font-[600] text-end pt-3">
        {orderData?.totalPrice
          ? orderData.totalPrice.toLocaleString("vi-VN") + " VNĐ"
          : "0 VNĐ"}
      </h5>
    </div>
  );
};

export default CartData;