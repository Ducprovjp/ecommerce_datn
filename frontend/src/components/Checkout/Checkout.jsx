import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getRequest } from "../../request/api";
import ShippingInfo from "./ShippingInfo";
import CartData from "./CartData";
import styles from "../../styles/styles";

const Checkout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [address1, setAddress1] = useState("");
  const [userInfo, setUserInfo] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAvailableCoupons();
  }, []);

  const fetchAvailableCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const response = await getRequest("/coupon/get-all-available-coupons");
      setAvailableCoupons(response.couponCodes);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const paymentSubmit = () => {
    if (address1 === "" || province === "" || district === "" || ward === "") {
      toast.error("Vui lòng chọn địa chỉ giao hàng!");
    } else {
      const shippingAddress = {
        address1,
        province,
        district,
        ward,
      };

      const orderData = {
        cart,
        totalPrice,
        subTotalPrice,
        shipping,
        discountPrice,
        shippingAddress,
        user,
        couponCode,
      };

      localStorage.setItem("latestOrder", JSON.stringify(orderData));
      navigate("/payment");
    }
  };

  const subTotalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  const shipping = subTotalPrice * 0.05;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!couponCode) {
      toast.error("Vui lòng chọn mã giảm giá");
      return;
    }

    const selectedCoupon = availableCoupons.find(
      (coupon) => coupon.name === couponCode
    );

    if (!selectedCoupon) {
      toast.error("Mã giảm giá không hợp lệ");
      return;
    }

    const shopId = selectedCoupon.shopId;
    // Kiểm tra sản phẩm thuộc cửa hàng và sản phẩm được chọn
    const isCouponValid = cart.filter(
      (item) =>
        item.shopId === shopId &&
        (!selectedCoupon.selectedProduct?.length || selectedCoupon.selectedProduct.includes(item.name))
    );

    if (isCouponValid.length === 0) {
      toast.error("Mã giảm giá không hợp lệ cho bất kỳ sản phẩm nào trong giỏ hàng");
      setCouponCode("");
      setDiscountPrice(null);
      setCouponCodeData(null);
      return;
    }

    const eligiblePrice = isCouponValid.reduce(
      (acc, item) => acc + item.qty * item.discountPrice,
      0
    );

    // Kiểm tra minAmount và maxAmount dựa trên tổng giá trị các sản phẩm đủ điều kiện
    if (selectedCoupon.minAmount && eligiblePrice < selectedCoupon.minAmount) {
      toast.error(`Tổng giá trị đơn hàng phải tối thiểu ${selectedCoupon.minAmount.toLocaleString("vi-VN")} VNĐ để áp dụng mã giảm giá`);
      setCouponCode("");
      setDiscountPrice(null);
      setCouponCodeData(null);
      return;
    }

    if (selectedCoupon.maxAmount && eligiblePrice > selectedCoupon.maxAmount) {
      toast.error(`Tổng giá trị đơn hàng không được vượt quá ${selectedCoupon.maxAmount.toLocaleString("vi-VN")} VNĐ để áp dụng mã giảm giá`);
      setCouponCode("");
      setDiscountPrice(null);
      setCouponCodeData(null);
      return;
    }

    let discountAmount = 0;

    if (selectedCoupon.discountType === "percentage") {
      discountAmount = (eligiblePrice * selectedCoupon.value) / 100;
    } else {
      discountAmount = selectedCoupon.value;
    }

    setDiscountPrice(discountAmount);
    setCouponCodeData(selectedCoupon);
  };

  const discountPercentenge = couponCodeData ? discountPrice : "";
  const totalPrice = couponCodeData
    ? subTotalPrice + shipping - discountPercentenge
    : subTotalPrice + shipping;

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
            className={`${styles.button} w-[150px] 800px:w-[280px] mt-4 800px:flex 800px:items-center 800px:justify-center hidden`}
            onClick={paymentSubmit}
          >
            <h5 className="text-white text-center">Tiến hành thanh toán</h5>
          </div>
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <CartData
            handleSubmit={handleSubmit}
            totalPrice={totalPrice}
            shipping={shipping}
            subTotalPrice={subTotalPrice}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            discountPercentenge={discountPercentenge}
            availableCoupons={availableCoupons}
            isLoadingCoupons={isLoadingCoupons}
            cart={cart}
          />
        </div>
      </div>
      <div
        className={`${styles.button} w-[150px] 800px:w-[280px] mt-4 800px:hidden block flex items-center justify-center`}
        onClick={paymentSubmit}
      >
        <h5 className="text-white text-center">Tiến hành thanh toán</h5>
      </div>
    </div>
  );
};

export default Checkout;