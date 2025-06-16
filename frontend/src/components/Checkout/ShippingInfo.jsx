import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/styles";

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
  const apiAdress = "https://provinces.open-api.vn/api";

  useEffect(() => {
    const getProvinces = async () => {
      const response = await axios.get(`${apiAdress}/p`);
      setProvinces(response.data);
    };
    getProvinces();
  }, []);

  useEffect(() => {
    if (province && districts.length === 0) {
      const selectedProvince = provinces.find((item) => item.name === province);
      if (selectedProvince) {
        axios
          .get(`${apiAdress}/p/${selectedProvince.code}?depth=2`)
          .then((res) => {
            setDistricts(res.data.districts || []);
          });
      }
    }
  }, [province, provinces]);

  useEffect(() => {
    if (district && wards.length === 0) {
      const selectedDistrict = districts.find((item) => item.name === district);
      if (selectedDistrict) {
        axios
          .get(`${apiAdress}/d/${selectedDistrict.code}?depth=2`)
          .then((res) => {
            setWards(res.data.wards || []);
          });
      }
    }
  }, [district, districts]);

  const handleSelectAddress = async (item) => {
    setSelectedAddress(item);
    setAddress1(item.address1);
    setProvince(item.province);

    const selectedProvince = provinces.find((p) => p.name === item.province);
    if (selectedProvince) {
      const provinceRes = await axios.get(
        `${apiAdress}/p/${selectedProvince.code}?depth=2`
      );
      setDistricts(provinceRes.data.districts || []);

      const selectedDistrict = provinceRes.data.districts.find(
        (d) => d.name === item.district
      );
      if (selectedDistrict) {
        const districtRes = await axios.get(
          `${apiAdress}/d/${selectedDistrict.code}?depth=2`
        );
        setWards(districtRes.data.wards || []);
        setDistrict(item.district);
        setWard(item.ward);
      } else {
        setDistricts([]);
        setDistrict("");
        setWards([]);
        setWard("");
      }
    } else {
      setDistricts([]);
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

export default ShippingInfo;