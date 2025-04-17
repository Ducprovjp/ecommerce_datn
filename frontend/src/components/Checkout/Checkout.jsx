import React, { useState } from "react";
import styles from "../../styles/styles";
import { Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const Checkout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const [province, setProvince] = useState(""); // Tỉnh/Thành phố
  const [district, setDistrict] = useState(""); // Quận/Huyện
  const [ward, setWard] = useState(""); // Phường/Xã
  const [address1, setAddress1] = useState("");
  const [userInfo, setUserInfo] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const paymentSubmit = () => {
    if ((address1 === "" || province === "" || district === "", ward === "")) {
      toast.error("Please choose your delivery address!");
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
      };

      // update local storage with the updated orders array
      localStorage.setItem("latestOrder", JSON.stringify(orderData));
      navigate("/payment");
    }
  };

  const subTotalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  // this is shipping cost variable
  const shipping = subTotalPrice * 0.1; // 10%

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = couponCode;

    await axios.get(`${server}/coupon/get-coupon-value/${name}`).then((res) => {
      const shopId = res.data.couponCode?.shopId;

      const couponCodeValue = res.data.couponCode?.value;

      if (res.data.couponCode !== null) {
        const isCouponValid =
          cart && cart.filter((item) => item.shopId === shopId);

        if (isCouponValid.length === 0) {
          toast.error("Coupon code is not valid for this shop");
          setCouponCode("");
        } else {
          const eligiblePrice = isCouponValid.reduce(
            (acc, item) => acc + item.qty * item.discountPrice,
            0
          );
          const discountPrice = (eligiblePrice * couponCodeValue) / 100;
          setDiscountPrice(discountPrice);
          setCouponCodeData(res.data.couponCode);
          setCouponCode("");
        }
      }
      if (res.data.couponCode === null) {
        toast.error("Coupon code doesn't exist!");
        setCouponCode("");
      }
    });
  };

  const discountPercentenge = couponCodeData ? discountPrice : "";

  const totalPrice = couponCodeData
    ? subTotalPrice + shipping - discountPercentenge
    : subTotalPrice + shipping;

  console.log(discountPercentenge);

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%]">
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
          />
        </div>
      </div>
      <div
        className={`${styles.button} w-[150px] 800px:w-[280px] mt-10`}
        onClick={paymentSubmit}
      >
        <h5 className="text-white">Go to Payment</h5>
      </div>
    </div>
  );
};

const ShippingInfo = ({
  user,
  province,
  setProvince,
  district,
  setDistrict,
  ward,
  setWard,
  userInfo,
  setUserInfo,
  address1,
  setAddress1,
}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const apiAdress = "https://provinces.open-api.vn/api"; // API lấy danh sách tỉnh/thành

  // Lấy danh sách tỉnh/thành ngay khi component được render
  useEffect(() => {
    const getProvinces = async () => {
      const response = await axios.get(`${apiAdress}/p`);
      setProvinces(response.data);
    };
    getProvinces();
  }, []);

  // Khi chọn tỉnh/thành, lấy danh sách quận/huyện (trừ khi đã chọn từ saved address)
  useEffect(() => {
    if (province && districts.length === 0) {
      // Chỉ gọi nếu chưa có dữ liệu
      const selectedProvince = provinces.find((item) => item.name === province);
      if (selectedProvince) {
        axios
          .get(`${apiAdress}/p/${selectedProvince.code}?depth=2`)
          .then((res) => {
            setDistricts(res.data.districts || []);
          });
      }
    }
  }, [province]);

  // Khi chọn quận/huyện, lấy danh sách phường/xã (trừ khi đã chọn từ saved address)
  useEffect(() => {
    if (district && wards.length === 0) {
      // Chỉ gọi nếu chưa có dữ liệu
      const selectedDistrict = districts.find((item) => item.name === district);
      if (selectedDistrict) {
        axios
          .get(`${apiAdress}/d/${selectedDistrict.code}?depth=2`)
          .then((res) => {
            setWards(res.data.wards || []);
          });
      }
    }
  }, [district]);

  const handleSelectAddress = async (item) => {
    setSelectedAddress(item); // Cập nhật địa chỉ được chọn
    setAddress1(item.address1);
    setProvince(item.province);

    // Tìm mã tỉnh để lấy danh sách quận/huyện
    const selectedProvince = provinces.find((p) => p.name === item.province);
    if (selectedProvince) {
      const provinceRes = await axios.get(
        `${apiAdress}/p/${selectedProvince.code}?depth=2`
      );
      setDistricts(provinceRes.data.districts || []);

      // Tìm mã quận để lấy danh sách phường/xã
      const selectedDistrict = provinceRes.data.districts.find(
        (d) => d.name === item.district
      );
      if (selectedDistrict) {
        const districtRes = await axios.get(
          `${apiAdress}/d/${selectedDistrict.code}?depth=2`
        );
        setWards(districtRes.data.wards || []);
        setDistrict(item.district); // Đặt district sau khi danh sách quận có dữ liệu
        setWard(item.ward); // Đặt ward sau khi danh sách phường có dữ liệu
      } else {
        setDistrict(""); // Nếu không tìm thấy, reset quận/huyện
        setWards([]); // Xóa danh sách phường/xã
        setWard("");
      }
    } else {
      setDistricts([]); // Nếu không tìm thấy tỉnh, reset danh sách quận/huyện
      setDistrict("");
      setWards([]);
      setWard("");
    }
  };

  return (
    <div className="w-full 800px:w-[95%] bg-white rounded-md p-5 pb-8">
      <h5 className="text-[18px] font-[500]">Shipping Address</h5>
      <br />
      <form>
        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Full Name</label>
            <input
              type="text"
              value={user && user.name}
              required
              className={`${styles.input} !w-[95%]`}
            />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">Email Address</label>
            <input
              type="email"
              value={user && user.email}
              required
              className={`${styles.input}`}
            />
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Phone Number</label>
            <input
              type="text"
              required
              value={user && user.phoneNumber}
              className={`${styles.input} !w-[95%]`}
            />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">Address1</label>
            <input
              type="address"
              required
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className={`${styles.input} !w-[95%]`}
            />
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Choose your Province</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-[95%] border h-[40px] rounded-[5px]"
            >
              <option value="">Choose your province</option>
              {provinces.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">Choose your District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-[95%] border h-[40px] rounded-[5px]"
            >
              <option value="">Choose your district</option>
              {districts.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Choose your Ward</label>
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="w-[95%] border h-[40px] rounded-[5px]"
            >
              <option value="">Choose your ward</option>
              {wards.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
      <h5
        className="text-[18px] cursor-pointer inline-block"
        onClick={() => setUserInfo(!userInfo)}
      >
        Choose from saved address
      </h5>
      {user &&
        user.addresses.map((item, index) => (
          <div key={index} className="w-full flex mt-1 items-center">
            <input
              type="checkbox"
              className="mr-3"
              checked={selectedAddress?.address1 === item.address1}
              onChange={async (e) => {
                if (e.target.checked) {
                  await handleSelectAddress(item);
                } else {
                  setSelectedAddress(null);
                  setAddress1("");
                  setProvince("");
                  setDistricts([]);
                  setDistrict("");
                  setWards([]);
                  setWard("");
                }
              }}
            />

            <h2
              className="cursor-pointer hover:underline"
              onClick={() => handleSelectAddress(item)}
            >
              {item.addressType}
            </h2>
          </div>
        ))}
    </div>
  );
};

const CartData = ({
  handleSubmit,
  totalPrice,
  shipping,
  subTotalPrice,
  couponCode,
  setCouponCode,
  discountPercentenge,
}) => {
  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Subtotal:</h3>
        <h5 className="text-[18px] font-[600]">
          {subTotalPrice.toLocaleString("vi-VN") + " VNĐ"}
        </h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Shipping:</h3>
        <h5 className="text-[18px] font-[600]">
          {shipping.toLocaleString("vi-VN") + " VNĐ"}
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
        {totalPrice.toLocaleString("vi-VN") + " VNĐ"}
      </h5>
      <br />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className={`${styles.input} h-[40px] pl-2`}
          placeholder="Coupoun code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          required
        />
        <input
          className={`w-full h-[40px] border border-[#f63b60] text-center text-[#f63b60] rounded-[3px] mt-8 cursor-pointer`}
          required
          value="Apply code"
          type="submit"
        />
      </form>
    </div>
  );
};

export default Checkout;
