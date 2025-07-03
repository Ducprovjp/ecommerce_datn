import React from "react";

const CartData = ({ orderData }) => {
  const cart = orderData?.cart || [];
  const subTotalPrice = orderData?.subTotalPrice || 0;
  const shipping = orderData?.shipping || 0;
  const totalPrice = orderData?.totalPrice || 0;
  const couponCodePerShop = orderData?.couponCodePerShop || {};
  const discountPricePerShop = orderData?.discountPricePerShop || {};
  const shippingPerShop = orderData?.shippingPerShop || {};
  const availableCoupons = orderData?.availableCoupons || [];

  // Debug
  console.log("CartData - shippingPerShop:", shippingPerShop);
  console.log("CartData - orderData:", orderData);

  // Nhóm sản phẩm theo shop
  const cartByShop = cart.reduce((acc, item) => {
    const shopId = item.shopId;
    if (!acc[shopId]) {
      acc[shopId] = { shopName: item.shop.name, items: [], subtotal: 0 };
    }
    acc[shopId].items.push(item);
    acc[shopId].subtotal += item.qty * (item.discountPrice || 0);
    return acc;
  }, {});

  // Tính giảm giá sản phẩm và phí ship riêng biệt
  const productDiscountPerShop = {};
  const shippingDiscountPerShop = {};
  Object.entries(couponCodePerShop).forEach(([shopId, codes]) => {
    let productDiscount = 0;
    let shippingDiscount = 0;

    if (codes?.product) {
      const coupon = availableCoupons.find(
        (c) => c.name === codes.product && c.applyTo === "product"
      );
      if (coupon) {
        const eligibleItems = cart.filter(
          (item) =>
            item.shopId === shopId &&
            (coupon.selectedProduct.length === 0 ||
              coupon.selectedProduct.includes("") ||
              coupon.selectedProduct.includes(item.name))
        );
        const eligiblePrice = eligibleItems.reduce(
          (acc, item) => acc + item.qty * (item.discountPrice || 0),
          0
        );
        if (
          (!coupon.minAmount || eligiblePrice >= coupon.minAmount) &&
          (!coupon.maxAmount || eligiblePrice <= coupon.maxAmount)
        ) {
          productDiscount =
            coupon.discountType === "percentage"
              ? (eligiblePrice * coupon.value) / 100
              : coupon.value;
        }
      }
    }

    if (codes?.shipping) {
      const coupon = availableCoupons.find(
        (c) => c.name === codes.shipping && c.applyTo === "shipping"
      );
      if (coupon) {
        const eligiblePrice = cartByShop[shopId]?.subtotal || 0;
        if (
          (!coupon.minAmount || eligiblePrice >= coupon.minAmount) &&
          (!coupon.maxAmount || eligiblePrice <= coupon.maxAmount)
        ) {
          const shippingFee = shippingPerShop[shopId] || 0;
          shippingDiscount =
            coupon.discountType === "percentage"
              ? Math.min((shippingFee * coupon.value) / 100, 50000)
              : Math.min(coupon.value, 50000);
        }
      }
    }

    productDiscountPerShop[shopId] = productDiscount;
    shippingDiscountPerShop[shopId] = shippingDiscount;
  });

  // Tính tổng tiền cho mỗi shop (subtotal + shipping - (product + shipping discount))
  const totalPerShop = Object.fromEntries(
    Object.entries(cartByShop).map(([shopId, shopData]) => [
      shopId,
      shopData.subtotal +
        (shippingPerShop[shopId] || 0) -
        ((productDiscountPerShop[shopId] || 0) + (shippingDiscountPerShop[shopId] || 0)),
    ])
  );

  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      <h3 className="text-[18px] font-[500] mb-4">Cart Items</h3>

      {Object.entries(cartByShop).map(([shopId, shopData]) => (
        <div key={shopId} className="mb-6 border-b pb-4">
          <h3 className="text-[16px] font-[600] mb-2 text-[#f63b60]">
            {shopData.shopName}
          </h3>

          {shopData.items.map((item, index) => (
            <div key={index} className="flex items-center mb-4">
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

          {couponCodePerShop[shopId]?.product && (
            <p className="text-[12px] text-green-600 mt-2">
              Product Coupon: {couponCodePerShop[shopId].product}
            </p>
          )}
          {couponCodePerShop[shopId]?.shipping && (
            <p className="text-[12px] text-green-600 mt-2">
              Shipping Coupon: {couponCodePerShop[shopId].shipping}
            </p>
          )}

          <div className="flex justify-between mb-2">
            <h3 className="text-[14px] font-[400] text-[#000000a4]">
              Subtotal:
            </h3>
            <h5 className="text-[14px] font-[600]">
              {shopData.subtotal.toLocaleString("vi-VN")} VNĐ
            </h5>
          </div>
          <div className="flex justify-between mb-2">
            <h3 className="text-[14px] font-[400] text-[#000000a4]">
              Shipping:
            </h3>
            <h5 className="text-[14px] font-[600]">
              {(shippingPerShop[shopId] || 0).toLocaleString("vi-VN")} VNĐ
            </h5>
          </div>
          {productDiscountPerShop[shopId] > 0 && (
            <div className="flex justify-between mb-2">
              <h3 className="text-[14px] font-[400] text-[#000000a4]">
                Product Discount:
              </h3>
              <h5 className="text-[14px] font-[600] text-green-600">
                - {productDiscountPerShop[shopId].toLocaleString("vi-VN")} VNĐ
              </h5>
            </div>
          )}
          {shippingDiscountPerShop[shopId] > 0 && (
            <div className="flex justify-between mb-2">
              <h3 className="text-[14px] font-[400] text-[#000000a4]">
                Shipping Discount:
              </h3>
              <h5 className="text-[14px] font-[600] text-green-600">
                - {shippingDiscountPerShop[shopId].toLocaleString("vi-VN")} VNĐ
              </h5>
            </div>
          )}
          <div className="flex justify-between border-b pb-3">
            <h3 className="text-[14px] font-[400] text-[#000000a4]">
              Shop Total:
            </h3>
            <h5 className="text-[14px] font-[600]">
              {totalPerShop[shopId].toLocaleString("vi-VN")} VNĐ
            </h5>
          </div>
        </div>
      ))}

      <div className="flex justify-between mb-2">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">
          Total Subtotal:
        </h3>
        <h5 className="text-[18px] font-[600]">
          {subTotalPrice.toLocaleString("vi-VN")} VNĐ
        </h5>
      </div>
      <div className="flex justify-between mb-2">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">
          Total Shipping:
        </h3>
        <h5 className="text-[18px] font-[600]">
          {shipping.toLocaleString("vi-VN")} VNĐ
        </h5>
      </div>
      {Object.values(productDiscountPerShop).reduce((acc, p) => acc + p, 0) > 0 && (
        <div className="flex justify-between mb-2">
          <h3 className="text-[16px] font-[400] text-[#000000a4]">
            Total Product Discount:
          </h3>
          <h5 className="text-[18px] font-[600] text-green-600">
            - {Object.values(productDiscountPerShop).reduce((acc, p) => acc + p, 0).toLocaleString("vi-VN")} VNĐ
          </h5>
        </div>
      )}
      {Object.values(shippingDiscountPerShop).reduce((acc, p) => acc + p, 0) > 0 && (
        <div className="flex justify-between mb-2">
          <h3 className="text-[ whiskey-600 mb-2">
            Total Shipping Discount:
          </h3>
          <h5 className="text-[18px] font-[600] text-green-600">
            - {Object.values(shippingDiscountPerShop).reduce((acc, p) => acc + p, 0).toLocaleString("vi-VN")} VNĐ
          </h5>
        </div>
      )}
      <div className="flex justify-between border-t pt-3">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">
          Grand Total:
        </h3>
        <h5 className="text-[18px] font-[600]">
          {totalPrice.toLocaleString("vi-VN")} VNĐ
        </h5>
      </div>
    </div>
  );
};

export default CartData;