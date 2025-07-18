import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineCamera } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loadSeller } from "../../redux/actions/user";
import { putRequest } from "../../request/api";
import styles from "../../styles/styles";

const ShopSettings = () => {
  const { seller } = useSelector((state) => state.seller);
  const [avatar, setAvatar] = useState();
  const [name, setName] = useState(seller && seller.name);
  const [description, setDescription] = useState(
    seller && seller.description ? seller.description : ""
  );
  const [phoneNumber, setPhoneNumber] = useState(seller && seller.phoneNumber);
  
  // Address states
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [address1, setAddress1] = useState("");
  const [addressType, setAddressType] = useState("Default");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const dispatch = useDispatch();
  const apiAddress = "https://provinces.open-api.vn/api";

  // Load existing address if available
  useEffect(() => {
    if (seller?.addresses?.length > 0) {
      const mainAddress = seller.addresses[0];
      setProvince(mainAddress.province);
      setDistrict(mainAddress.district);
      setWard(mainAddress.ward);
      setAddress1(mainAddress.address1);
      setAddressType(mainAddress.addressType);
    }
  }, [seller]);

  useEffect(() => {
    const getProvinces = async () => {
      const response = await axios.get(`${apiAddress}/p`);
      setProvinces(response.data);
    };
    getProvinces();
  }, []);

  useEffect(() => {
    if (province) {
      const selectedProvince = provinces.find((item) => item.name === province);
      if (selectedProvince) {
        axios.get(`${apiAddress}/p/${selectedProvince.code}?depth=2`).then((res) => {
          setDistricts(res.data.districts || []);
        });
      }
    } else {
      setDistricts([]);
    }
    setDistrict("");
  }, [province, provinces]);

  useEffect(() => {
    if (district) {
      const selectedDistrict = districts.find((item) => item.name === district);
      if (selectedDistrict) {
        axios.get(`${apiAddress}/d/${selectedDistrict.code}?depth=2`).then((res) => {
          setWards(res.data.wards || []);
        });
      }
    } else {
      setWards([]);
    }
    setWard("");
  }, [district, districts]);

  const handleImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setAvatar(file);
  
    const formData = new FormData();
    formData.append("image", file);
  
    try {
      const res = await putRequest("/shop/update-avatar", formData);
      if (!res.success) {
        throw new Error(res.message || "Failed to update avatar");
      }
      dispatch(loadSeller());
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Update avatar error:", error);
      toast.error(error.message || "Failed to update avatar");
    }
  };

  const updateHandler = async (e) => {
    e.preventDefault();

    if (!name || !phoneNumber || !province || !district || !ward || !address1) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const addressData = {
      province,
      district,
      ward,
      address1,
      addressType
    };

    try {
      const res = await putRequest("/shop/update-seller-info", {
        name,
        phoneNumber,
        description,
        addresses: [addressData]
      });
      
      if (!res.success) {
        throw new Error(res.message || "Failed to update shop info");
      }
      
      toast.success("Shop info updated successfully!");
      dispatch(loadSeller());
    } catch (error) {
      console.error("Update shop info error:", error);
      toast.error(error.message || "Failed to update shop info");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="flex w-full 800px:w-[80%] flex-col justify-center my-5">
        <div className="w-full flex items-center justify-center">
          <div className="relative">
            <img
              src={avatar ? URL.createObjectURL(avatar) : `${seller.avatar}`}
              alt=""
              className="w-[200px] h-[200px] rounded-full cursor-pointer"
            />
            <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[10px] right-[15px]">
              <input
                type="file"
                id="image"
                className="hidden"
                onChange={handleImage}
              />
              <label htmlFor="image">
                <AiOutlineCamera />
              </label>
            </div>
          </div>
        </div>

        <form
          aria-required={true}
          className="flex flex-col items-center"
          onSubmit={updateHandler}
        >
          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Name*</label>
            </div>
            <input
              type="name"
              placeholder={`${seller.name}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Phone Number*</label>
            </div>
            <input
              type="text"
              placeholder={seller?.phoneNumber}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Tỉnh/Thành phố*</label>
            </div>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {provinces.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Quận/Huyện*</label>
            </div>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              disabled={!province}
              required
            >
              <option value="">Chọn Quận/Huyện</option>
              {districts.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Phường/Xã*</label>
            </div>
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              disabled={!district}
              required
            >
              <option value="">Chọn Phường/Xã</option>
              {wards.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Địa chỉ chi tiết*</label>
            </div>
            <input
              type="text"
              placeholder="Số nhà, tên đường, toà nhà..."
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Loại địa chỉ</label>
            </div>
            <select
              value={addressType}
              onChange={(e) => setAddressType(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
            >
              <option value="Default">Mặc định</option>
              <option value="Home">Nhà riêng</option>
              <option value="Office">Văn phòng</option>
            </select>
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop description</label>
            </div>
            <input
              type="name"
              placeholder={`${
                seller?.description
                  ? seller.description
                  : "Enter your shop description"
              }`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
            />
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <input
              type="submit"
              value="Update Shop"
              className={`${styles.button} !w-[95%] mb-4 800px:mb-0`}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopSettings;