// src/components/ProfileContent/Address.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteUserAddress, updateUserAddress } from "../../../redux/actions/user";
import { AiOutlineDelete } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";
import axios from "axios";
import styles from "../../../styles/styles";

const Address = () => {
  const [open, setOpen] = useState(false);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [address1, setAddress1] = useState("");
  const [addressType, setAddressType] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const addressTypeData = [
    { name: "Default" },
    { name: "Home" },
    { name: "Office" },
  ];

  const apiAdress = "https://provinces.open-api.vn/api";

  useEffect(() => {
    const getProvinces = async () => {
      const response = await axios.get(`${apiAdress}/p`);
      setProvinces(response.data);
    };
    getProvinces();
  }, []);

  useEffect(() => {
    if (province) {
      const selectedProvince = provinces.find((item) => item.name === province);
      if (selectedProvince) {
        axios.get(`${apiAdress}/p/${selectedProvince.code}?depth=2`).then((res) => {
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
        axios.get(`${apiAdress}/d/${selectedDistrict.code}?depth=2`).then((res) => {
          setWards(res.data.wards || []);
        });
      }
    } else {
      setWards([]);
    }
    setWard("");
  }, [district, districts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!addressType || !province || !district || !ward || !address1) {
      toast.error("Vui lòng điền đầy đủ các trường!");
    } else {
      dispatch(updateUserAddress(province, district, ward, address1, addressType));
      setOpen(false);
      setProvince("");
      setDistrict("");
      setWard("");
      setAddress1("");
      setAddressType("");
    }
  };

  const handleDelete = (item) => {
    dispatch(deleteUserAddress(item._id));
  };

  return (
    <div className="w-full px-5">
      {open && (
        <div className="fixed w-full h-screen bg-[#0000004b] top-0 left-0 flex items-center justify-center">
          <div className="w-[35%] h-[80vh] bg-white rounded shadow relative overflow-y-scroll">
            <div className="w-full flex justify-end p-3">
              <RxCross1 size={30} className="cursor-pointer" onClick={() => setOpen(false)} />
            </div>
            <h1 className="text-center text-[25px] font-Poppins">Thêm địa chỉ mới</h1>
            <div className="w-full">
              <form aria-required onSubmit={handleSubmit} className="w-full">
                <div className="w-full block p-4">
                  <div className="w-full pb-2">
                    <label className="block pb-2">Chọn Tỉnh/Thành phố</label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-[95%] border h-[40px] rounded-[5px]"
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map((item) => (
                        <option key={item.code} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full pb-2">
                    <label className="block pb-2">Chọn Quận/Huyện</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-[95%] border h-[40px] rounded-[5px]"
                      disabled={!province}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((item) => (
                        <option key={item.code} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full pb-2">
                    <label className="block pb-2">Chọn Phường/Xã</label>
                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="w-[95%] border h-[40px] rounded-[5px]"
                      disabled={!district}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map((item) => (
                        <option key={item.code} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full pb-2">
                    <label className="block pb-2">Địa chỉ chi tiết</label>
                    <input
                      type="address"
                      className={`${styles.input}`}
                      required
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block pb-2">Loại địa chỉ</label>
                    <select
                      value={addressType}
                      onChange={(e) => setAddressType(e.target.value)}
                      className="w-[95%] border h-[40px] rounded-[5px]"
                    >
                      <option value="">Chọn loại địa chỉ</option>
                      {addressTypeData.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full pb-2">
                    <input
                      type="submit"
                      className={`${styles.input} mt-5 cursor-pointer`}
                      required
                      readOnly
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="flex w-full items-center justify-between">
        <h1 className="text-[25px] font-[600] text-[#000000ba] pb-2">My address</h1>
        <div className={`${styles.button} rounded-md`} onClick={() => setOpen(true)}>
          <span className="text-[#fff]">Add new</span>
        </div>
      </div>
      <br />
      {user?.addresses.map((item, index) => (
        <div
          className="w-full bg-white h-min 800px:h-[70px] rounded-[4px] flex items-center px-3 shadow justify-between pr-10 mb-5"
          key={index}
        >
          <div className="flex items-center">
            <h5 className="pl-5 font-[600]">{item.addressType}</h5>
          </div>
          <div className="pl-8 flex items-center">
            <h6 className="text-[12px] 800px:text-[unset]">{item.address1}</h6>
          </div>
          <div className="pl-8 flex items-center">
            <h6 className="text-[12px] 800px:text-[unset]">{user.phoneNumber}</h6>
          </div>
          <div className="min-w-[10%] flex items-center justify-between pl-8">
            <AiOutlineDelete size={25} className="cursor-pointer" onClick={() => handleDelete(item)} />
          </div>
        </div>
      ))}
      {user?.addresses.length === 0 && (
        <h5 className="text-center pt-8 text-[18px]">
          Bạn chưa có địa chỉ nào được lưu!
        </h5>
      )}
    </div>
  );
};

export default Address;