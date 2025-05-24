import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineCamera } from "react-icons/ai";
import styles from "../../styles/styles";
import { putRequest } from "../../request/api"; // Import putRequest
import { loadShipper } from "../../redux/actions/user";
import { toast } from "react-toastify";

const ShipperSettings = () => {
  const { shipper } = useSelector((state) => state.shipper);
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState(shipper && shipper.name);
  const [description, setDescription] = useState(
    shipper && shipper.description ? shipper.description : ""
  );
  const [address, setAddress] = useState(shipper && shipper.address);
  const [phoneNumber, setPhoneNumber] = useState(
    shipper && shipper.phoneNumber
  );
  const [zipCode, setZipcode] = useState(shipper && shipper.zipCode);

  const dispatch = useDispatch();

  // Image updated
  const handleImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setAvatar(file);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await putRequest("/shipper/update-shipper-avatar", formData);
      if (!res.success) {
        throw new Error(res.message || "Failed to update avatar");
      }
      dispatch(loadShipper());
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Update avatar error:", error);
      toast.error(error.message || "Failed to update avatar");
    }
  };

  const updateHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await putRequest("/shipper/update-shipper-info", {
        name,
        address,
        zipCode,
        phoneNumber,
        description,
      });
      if (!res.success) {
        throw new Error(res.message || "Failed to update shipper info");
      }
      toast.success("Shipper info updated successfully!");
      dispatch(loadShipper());
    } catch (error) {
      console.error("Update shipper info error:", error);
      toast.error(error.message || "Failed to update shipper info");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="flex w-full 800px:w-[80%] flex-col justify-center my-5">
        <div className="w-full flex items-center justify-center">
          <div className="relative">
            <img
              src={avatar ? URL.createObjectURL(avatar) : shipper?.avatar}
              alt="Shipper avatar"
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

        {/* Shipper info */}
        <form
          aria-required={true}
          className="flex flex-col items-center"
          onSubmit={updateHandler}
        >
          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shipper Name</label>
            </div>
            <input
              type="text"
              placeholder={shipper?.name || "Enter shipper name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>
          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shipper Description</label>
            </div>
            <input
              type="text"
              placeholder={
                shipper?.description
                  ? shipper.description
                  : "Enter your description"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
            />
          </div>
          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shipper Address</label>
            </div>
            <input
              type="text"
              placeholder={shipper?.address || "Enter shipper address"}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>
          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shipper Phone Number</label>
            </div>
            <input
              type="text"
              placeholder={shipper?.phoneNumber || "Enter phone number"}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>
          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <input
              type="submit"
              value="Update Shipper Profile"
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0 cursor-pointer`}
              required
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShipperSettings;