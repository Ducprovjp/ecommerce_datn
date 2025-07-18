import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineCamera, AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loadSeller } from "../../redux/actions/user";
import { putRequest } from "../../request/api";
import styles from "../../styles/styles";

const ShopEditModal = ({ onClose }) => {
  const { seller } = useSelector((state) => state.seller);
  const [avatar, setAvatar] = useState();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Address states
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const dispatch = useDispatch();
  const apiAddress = "https://provinces.open-api.vn/api";

  // Load existing shop data
  useEffect(() => {
    if (seller) {
      setName(seller.name || "");
      setDescription(seller.description || "");
      setPhoneNumber(seller.phoneNumber || "");

      // Load address from addresses array or parse legacy address field
      if (seller.addresses && seller.addresses.length > 0) {
        const address = seller.addresses[0];
        setProvince(address.province || "");
        setDistrict(address.district || "");
        setWard(address.ward || "");
        setAddressDetail(address.address1 || "");
      } else if (seller.address) {
        // Parse legacy address string (e.g., "160 Đê La Thành nhỏ, Phường Khâm Thiên, Quận Đống Đa, Thành phố Hà Nội")
        const addressParts = seller.address.split(", ");
        if (addressParts.length >= 4) {
          setAddressDetail(addressParts[0] || "");
          setWard(addressParts[1].replace("Phường ", "") || "");
          setDistrict(addressParts[2].replace("Quận ", "") || "");
          setProvince(addressParts[3].replace("Thành phố ", "") || "");
        }
      }
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

    if (!name || !phoneNumber || !province || !district || !ward || !addressDetail) {
      toast.error("Please fill in all required fields");
      return;
    }

    const addressData = {
      province,
      district,
      ward,
      address1: addressDetail,
      addressType: "Default"
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
      
      toast.success("Shop information updated successfully!");
      dispatch(loadSeller());
      onClose();
    } catch (error) {
      console.error("Update shop info error:", error);
      toast.error(error.message || "Failed to update shop info");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Edit Shop Information</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <AiOutlineClose size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={avatar ? URL.createObjectURL(avatar) : (seller?.avatar || "")}
                alt="Shop avatar"
                className="w-[150px] h-[150px] rounded-full cursor-pointer object-cover"
              />
              <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[10px] right-[15px]">
                <input
                  type="file"
                  id="image"
                  className="hidden"
                  onChange={handleImage}
                />
                <label htmlFor="image" className="cursor-pointer">
                  <AiOutlineCamera />
                </label>
              </div>
            </div>
          </div>

          <form onSubmit={updateHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name*</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${styles.input} !w-full`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`${styles.input} !w-full`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province/City*</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className={`${styles.input} !w-full`}
                required
              >
                <option value="">Select Province/City</option>
                {provinces.map((item) => (
                  <option key={item.code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District*</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={`${styles.input} !w-full`}
                disabled={!province}
                required
              >
                <option value="">Select District</option>
                {districts.map((item) => (
                  <option key={item.code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ward*</label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className={`${styles.input} !w-full`}
                disabled={!district}
                required
              >
                <option value="">Select Ward</option>
                {wards.map((item) => (
                  <option key={item.code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Detail*</label>
              <input
                type="text"
                placeholder="House number, street name..."
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                className={`${styles.input} !w-full`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${styles.input} !w-full`}
                rows="3"
                placeholder="Enter your shop description"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`${styles.button} !bg-gray-300 !text-black`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.button}`}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopEditModal;