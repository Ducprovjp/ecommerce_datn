import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getRequest } from "../../request/api";
import styles from "../../styles/styles";
import CartData from "./CartData";
import ShippingInfo from "./ShippingInfo";

const Checkout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [address1, setAddress1] = useState("");
  const [userInfo, setUserInfo] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [openCouponModal, setOpenCouponModal] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [tempCouponCodePerShop, setTempCouponCodePerShop] = useState({});
  const [couponCodePerShop, setCouponCodePerShop] = useState({});
  const [discountPricePerShop, setDiscountPricePerShop] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAvailableCoupons();
  }, []);

  const fetchAvailableCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const response = await getRequest("/coupon/get-all-available-coupons");
      if (response.success && Array.isArray(response.couponCodes)) {
        setAvailableCoupons(response.couponCodes);
      } else {
        throw new Error(response.message || "Failed to fetch coupons");
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Unable to load the list of coupon codes");
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const shopData = cart.reduce((acc, item) => {
    const shopId = item.shopId;
    if (!acc[shopId]) {
      acc[shopId] = { subtotal: 0, shopAddress: item.shop.address };
    }
    acc[shopId].subtotal += item.qty * (item.discountPrice || 0);
    return acc;
  }, {});

  const shippingPerShop = Object.fromEntries(
    Object.entries(shopData).map(([shopId, data]) => {
      const shopAddress = data.shopAddress || {};
      if (!shopAddress.province || !province) {
        return [shopId, 30000]; // Mặc định 30,000 VNĐ nếu thiếu địa chỉ
      }
      if (shopAddress.province !== province) {
        return [shopId, 35000]; // Khác tỉnh: 35,000 VNĐ
      }
      if (shopAddress.district !== district || shopAddress.ward !== ward) {
        return [shopId, 30000]; // Khác quận/huyện hoặc khác phường: 30,000 VNĐ
      }
      return [shopId, 20000]; // Cùng phường: 20,000 VNĐ
    })
  );

  const subTotalPrice = Object.values(shopData).reduce(
    (acc, data) => acc + data.subtotal,
    0
  );

  const shipping = Object.values(shippingPerShop).reduce(
    (acc, fee) => acc + fee,
    0
  );

  const totalDiscount = Object.values(discountPricePerShop).reduce(
    (acc, price) => acc + (price || 0),
    0
  );

  const totalPrice = subTotalPrice + shipping - totalDiscount;

  useEffect(() => {
    console.log("Shop Data:", shopData);
    console.log("Shipping Per Shop:", shippingPerShop);
    console.log("Total Discount:", totalDiscount);
    console.log("Total Price:", totalPrice);
    console.log("Discount Price Per Shop:", discountPricePerShop);
    console.log("User Address:", { province, district, ward });
  }, [shopData, shippingPerShop, totalDiscount, totalPrice, discountPricePerShop, province, district, ward]);

  const paymentSubmit = () => {
    if (!address1 || !province || !district || !ward) {
      toast.error("Please choose a shipping address!");
      return;
    }
    const shippingAddress = { address1, province, district, ward };
    const orderData = {
      cart,
      totalPrice,
      subTotalPrice,
      shipping,
      discountPrice: totalDiscount,
      shippingAddress,
      user,
      couponCodePerShop,
    };
    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    navigate("/payment");
  };

  const handleCouponChange = (shopId, code, type) => {
    setTempCouponCodePerShop((prev) => ({
      ...prev,
      [shopId]: {
        ...prev[shopId] || {},
        [type]: code || "",
      },
    }));
  };

  const applyCoupons = () => {
    const newDiscounts = {};
    const errors = [];

    console.log("Cart Data:", cart);

    for (const [shopId, codes] of Object.entries(tempCouponCodePerShop)) {
      let shopDiscount = 0;

      // Product coupon
      if (codes?.product) {
        const selectedCoupon = availableCoupons.find(
          (coupon) => coupon.name === codes.product && coupon.applyTo === "product"
        );

        if (!selectedCoupon) {
          errors.push(`Invalid product coupon code ${codes.product} for shop ${shopId}`);
          continue;
        }

        const isCouponValid = cart.filter(
          (item) =>
            item.shopId === shopId &&
            (selectedCoupon.selectedProduct.length === 0 ||
              selectedCoupon.selectedProduct.includes("") ||
              selectedCoupon.selectedProduct.includes(item.name))
        );

        if (isCouponValid.length === 0) {
          errors.push(`Coupon code ${codes.product} is not valid for any products in this shop`);
          continue;
        }

        const eligiblePrice = isCouponValid.reduce(
          (acc, item) => acc + (item.qty * (item.discountPrice || 0)),
          0
        );

        console.log(`Shop ${shopId}: Product eligiblePrice = ${eligiblePrice}`);

        if (selectedCoupon.minAmount && eligiblePrice < selectedCoupon.minAmount) {
          errors.push(
            `Shop ${shopId}: Total product value must be at least ${selectedCoupon.minAmount.toLocaleString("vi-VN")} VNĐ`
          );
          continue;
        }

        if (selectedCoupon.maxAmount && eligiblePrice > selectedCoupon.maxAmount) {
          errors.push(
            `Shop ${shopId}: Total product value must not exceed ${selectedCoupon.maxAmount.toLocaleString("vi-VN")} VNĐ`
          );
          continue;
        }

        let discountAmount = 0;
        if (selectedCoupon.discountType === "percentage") {
          discountAmount = (eligiblePrice * selectedCoupon.value) / 100;
        } else {
          discountAmount = selectedCoupon.value;
        }
        shopDiscount += discountAmount;
      }

      // Shipping coupon
      if (codes?.shipping) {
        const selectedCoupon = availableCoupons.find(
          (coupon) => coupon.name === codes.shipping && coupon.applyTo === "shipping"
        );

        if (!selectedCoupon) {
          errors.push(`Invalid shipping coupon code ${codes.shipping} for shop ${shopId}`);
          continue;
        }

        const eligiblePrice = shopData[shopId]?.subtotal || 0;
        console.log(`Shop ${shopId}: Shipping coupon eligiblePrice (subtotal) = ${eligiblePrice}`);

        if (selectedCoupon.minAmount && eligiblePrice < selectedCoupon.minAmount) {
          errors.push(
            `Shop ${shopId}: Total product value must be at least ${selectedCoupon.minAmount.toLocaleString("vi-VN")} VNĐ to apply shipping coupon`
          );
          continue;
        }

        if (selectedCoupon.maxAmount && eligiblePrice > selectedCoupon.maxAmount) {
          errors.push(
            `Shop ${shopId}: Total product value must not exceed ${selectedCoupon.maxAmount.toLocaleString("vi-VN")} VNĐ to apply shipping coupon`
          );
          continue;
        }

        const shippingFee = shippingPerShop[shopId] || 0;
        let discountAmount = 0;
        if (selectedCoupon.discountType === "percentage") {
          discountAmount = Math.min(
            (shippingFee * selectedCoupon.value) / 100,
            50000 // Giới hạn tối đa 50,000 VNĐ
          );
        } else {
          discountAmount = Math.min(selectedCoupon.value, 50000);
        }
        shopDiscount += discountAmount;
      }

      newDiscounts[shopId] = shopDiscount;
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    setCouponCodePerShop(tempCouponCodePerShop);
    setDiscountPricePerShop(newDiscounts);
    toast.success("Coupons applied successfully");
    setOpenCouponModal(false);
    setSelectedShopId(null);
  };

  const openCouponSelector = (shopId) => {
    if (!shopId) {
      toast.error("Invalid shop ID");
      return;
    }
    setSelectedShopId(shopId);
    setTempCouponCodePerShop((prev) => ({
      ...prev,
      [shopId]: couponCodePerShop[shopId] || {},
    }));
    setOpenCouponModal(true);
  };

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%] flex flex-col">
          <ShippingInfo
            user={user}
            province={province}
            setProvince={setProvince}
            district={district}
            setDistrict={setDistrict}
            ward={ward}
            setWard={setWard}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            address1={address1}
            setAddress1={setAddress1}
          />
          <div
            className={`${styles.button} w-[150px] 800px:w-[280px] mt-4 hidden 800px:flex 800px:items-center 800px:justify-center`}
            onClick={paymentSubmit}
          >
            <h5 className="text-white text-center">Go to Payment</h5>
          </div>
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <CartData
            cart={cart}
            subTotalPrice={subTotalPrice}
            shipping={shipping}
            totalPrice={totalPrice}
            availableCoupons={availableCoupons}
            isLoadingCoupons={isLoadingCoupons}
            couponCodePerShop={couponCodePerShop}
            discountPricePerShop={discountPricePerShop}
            openCouponSelector={openCouponSelector}
            shippingPerShop={shippingPerShop}
          />
        </div>
      </div>
      <div
        className={`${styles.button} w-[150px] 800px:w-[280px] mt-4 800px:hidden block flex items-center justify-center`}
        onClick={paymentSubmit}
      >
        <h5 className="text-white text-center">Go to Payment</h5>
      </div>
      {openCouponModal && selectedShopId && (
        <div className="fixed top-0 left-0 w-full h-screen bg-[#00000062] z-[20000] flex items-center justify-center">
          <div className="w-[90%] 800px:w-[40%] bg-white rounded-md shadow p-4">
            <div className="w-full flex justify-end">
              <RxCross1
                size={30}
                className="cursor-pointer"
                onClick={() => {
                  setOpenCouponModal(false);
                  setSelectedShopId(null);
                }}
              />
            </div>
            <h5 className="text-[20px] font-Poppins text-center mb-4">
              Select Coupon
            </h5>
            <div className="mb-4">
              <h6 className="text-[16px] font-[600] mb-2">Product Coupon</h6>
              <select
                value={tempCouponCodePerShop[selectedShopId]?.product || ""}
                onChange={(e) => handleCouponChange(selectedShopId, e.target.value, "product")}
                className={`${styles.input} h-[40px] pl-2 w-full`}
              >
                <option value="">Select a coupon</option>
                {availableCoupons
                  .filter((coupon) => coupon.shopId === selectedShopId && coupon.applyTo === "product")
                  .map((coupon) => (
                    <option key={coupon.name} value={coupon.name}>
                      {coupon.name} -{" "}
                      {coupon.discountType === "percentage"
                        ? `${coupon.value}% off`
                        : `${coupon.value.toLocaleString("vi-VN")} VNĐ off`}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mb-4">
              <h6 className="text-[16px] font-[600] mb-2">Shipping Coupon</h6>
              <select
                value={tempCouponCodePerShop[selectedShopId]?.shipping || ""}
                onChange={(e) => handleCouponChange(selectedShopId, e.target.value, "shipping")}
                className={`${styles.input} h-[40px] pl-2 w-full`}
              >
                <option value="">Select a coupon</option>
                {availableCoupons
                  .filter((coupon) => coupon.shopId === selectedShopId && coupon.applyTo === "shipping")
                  .map((coupon) => (
                    <option key={coupon.name} value={coupon.name}>
                      {coupon.name} -{" "}
                      {coupon.discountType === "percentage"
                        ? `${coupon.value}% off`
                        : `${coupon.value.toLocaleString("vi-VN")} VNĐ off`}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mt-4">
              <button
                className={`${styles.button} w-full h-[40px]`}
                onClick={applyCoupons}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;