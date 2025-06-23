// src/components/ProfileContent/ProfileSection.jsx
import React, { useEffect, useState } from "react";
import { AiOutlineCamera } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loadUser, updateUserInformation } from "../../../redux/actions/user";
import { putFormDataRequest } from "../../../request/api";
import styles from "../../../styles/styles";

const ProfileSection = () => {
  const { user, error, successMessage } = useSelector((state) => state.user);
  const [name, setName] = useState(user && user.name);
  const [email, setEmail] = useState(user && user.email);
  const [phoneNumber, setPhoneNumber] = useState(user && user.phoneNumber);
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch({ type: "clearErrors" });
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch({ type: "clearMessages" });
    }
  }, [error, successMessage, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserInformation(name, email, phoneNumber, password));
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await putFormDataRequest("/user/update-avatar", formData);
      if (!res.success) {
        throw new Error(res.message || "Cập nhật ảnh đại diện thất bại");
      }
      dispatch(loadUser());
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật ảnh đại diện:", error);
      toast.error(error.message || "Cập nhật ảnh đại diện thất bại");
    }
  };

  return (
    <div>
      <div className="flex justify-center w-full">
        <div className="relative">
          <img
            src={user?.avatar}
            className="w-[150px] h-[150px] rounded-full object-cover border-[3px] border-[#3ad132]"
            alt="profile img"
          />
          <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[5px] right-[5px]">
            <input type="file" id="image" className="hidden" onChange={handleImage} />
            <label htmlFor="image">
              <AiOutlineCamera />
            </label>
          </div>
        </div>
      </div>
      <br />
      <br />
      <div className="w-full px-5">
        <form onSubmit={handleSubmit} aria-required={true}>
          <div className="w-full 800px:flex block pb-3">
            <div className="w-[100%] 800px:w-[50%]">
              <label className="block pb-2">Full name</label>
              <input
                type="text"
                className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="w-[100%] 800px:w-[50%]">
              <label className="block pb-2">Email</label>
              <input
                type="text"
                className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full 800px:flex block pb-3">
            <div className="w-[100%] 800px:w-[50%]">
              <label className="block pb-2">Phone number</label>
              <input
                type="number"
                className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="w-[100%] 800px:w-[50%]">
              <label className="block pb-2">Enter password</label>
              <input
                type="password"
                className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <input
            className="w-[250px] h-[40px] border border-[#3a24db] text-center text-[#3a24db] rounded-[3px] mt-8 cursor-pointer"
            required
            value="Update"
            type="submit"
          />
        </form>
      </div>
    </div>
  );
};

export default ProfileSection;