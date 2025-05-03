import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteShipperDeliveredArea,
  updateShipperDeliveredArea,
} from "../../redux/actions/shippers";
import { AiOutlineDelete } from "react-icons/ai";
import styles from "../../styles/styles";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";
import axios from "axios";
// import shipper from "../../../../backend/model/shipper";

const DeliveredArea = () => {
  const [open, setOpen] = useState(false);
  const [province, setProvince] = useState(""); // Tỉnh/Thành phố
  const [district, setDistrict] = useState(""); // Quận/Huyện
  const [ward, setWard] = useState(""); // Phường/Xã

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const { shipper } = useSelector((state) => state.shipper);
  const dispatch = useDispatch();

  const apiAdress = "https://provinces.open-api.vn/api"; // API lấy danh sách tỉnh/thành

  // Lấy danh sách tỉnh/thành ngay khi component được render
  useEffect(() => {
    const getProvinces = async () => {
      const response = await axios.get(`${apiAdress}/p`);
      setProvinces(response.data);
    };
    getProvinces();
  }, []);

  // Khi chọn tỉnh/thành, lấy danh sách quận/huyện
  useEffect(() => {
    if (province) {
      const selectedProvince = provinces.find((item) => item.name === province);
      if (selectedProvince) {
        axios
          .get(`${apiAdress}/p/${selectedProvince.code}?depth=2`)
          .then((res) => {
            setDistricts(res.data.districts || []);
          });
      }
    } else {
      setDistricts([]);
    }
    setDistrict(""); // Reset quận/huyện khi đổi tỉnh
  }, [province]);

  // Khi chọn quận/huyện, lấy danh sách phường/xã
  useEffect(() => {
    if (district) {
      const selectedDistrict = districts.find((item) => item.name === district);
      if (selectedDistrict) {
        axios
          .get(`${apiAdress}/d/${selectedDistrict.code}?depth=2`)
          .then((res) => {
            setWards(res.data.wards || []);
          });
      }
    } else {
      setWards([]);
    }
    setWard(""); // Reset phường/xã khi đổi quận
  }, [district]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (province === "" || district === "" || ward === "") {
      toast.error("Please fill all the fields!");
    } else {
      dispatch(updateShipperDeliveredArea(province, district, ward));
      setOpen(false);
      setProvince("");
      setDistrict("");
      setWard("");
    }
  };

  const handleDelete = (item) => {
    const id = item._id;
    dispatch(deleteShipperDeliveredArea(id));
  };

  return (
    <div className="w-full px-5">
      {open && (
        <div className="fixed w-full h-screen bg-[#0000004b] top-0 left-0 flex items-center justify-center ">
          <div className="w-[35%] h-[80vh] bg-white rounded shadow relative overflow-y-scroll">
            <div className="w-full flex justify-end p-3">
              <RxCross1
                size={30}
                className="cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>
            <h1 className="text-center text-[25px] font-Poppins">
              Add New Delivered Area
            </h1>
            <div className="w-full">
              <form aria-required onSubmit={handleSubmit} className="w-full">
                <div className="w-full block p-4">
                  {/* Chọn Tỉnh/Thành phố */}
                  <div className="w-full pb-2">
                    <label className="block pb-2">Choose your Province</label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-[95%] border h-[40px] rounded-[5px]"
                      // disabled={!country}
                    >
                      <option value="">Choose your province</option>
                      {provinces.map((item) => (
                        <option key={item.code} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chọn Quận/Huyện */}
                  <div className="w-full pb-2">
                    <label className="block pb-2">Choose your District</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-[95%] border h-[40px] rounded-[5px]"
                      disabled={!province}
                    >
                      <option value="">Choose your district</option>
                      {districts.map((item) => (
                        <option key={item.code} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chọn Phường/Xã */}
                  <div className="w-full pb-2">
                    <label className="block pb-2">Choose your Ward</label>
                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="w-[95%] border h-[40px] rounded-[5px]"
                      disabled={!district}
                    >
                      <option value="">Choose your ward</option>
                      {wards.map((item) => (
                        <option key={item.code} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className=" w-full pb-2">
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
        <h1 className="text-[25px] font-[600] text[#000000ba] pb-2">
          My Delivered Area
        </h1>
        <div
          className={`${styles.button} rounded-md`}
          onClick={() => setOpen(true)}
        >
          <span className="text-[#fff]">Add New</span>
        </div>
      </div>
      <br />

      {shipper &&
        shipper.deliveredArea.map((item, index) => (
          <div
            className="w-full bg-white h-min 800px:h-[70px] rounded-[4px] flex items-center px-3 shadow justify-between pr-10 mb-5"
            key={index}
          >
            <div className="pl-8 flex items-center">
              <h6 className="text-[20px] 800px:text-[unset]">
                {item.ward}, {item.district}, {item.province}
              </h6>
            </div>

            <div className="min-w-[10%] flex items-center justify-between pl-8">
              <AiOutlineDelete
                size={25}
                className="cursor-pointer"
                onClick={() => handleDelete(item)}
              />
            </div>
          </div>
        ))}

      {shipper && shipper.deliveredArea.length === 0 && (
        <h5 className="text-center pt-8 text-[18px]">
          You not have any saved delivered area!
        </h5>
      )}
    </div>
  );
};

export default DeliveredArea;
