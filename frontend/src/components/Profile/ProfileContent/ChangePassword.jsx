// src/components/ProfileContent/ChangePassword.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { putRequest } from "../../../request/api";
import styles from "../../../styles/styles";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordChangeHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await putRequest("/user/update-user-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      if (!res.success) {
        throw new Error(res.message || "Đổi mật khẩu thất bại");
      }
      toast.success("Đổi mật khẩu thành công");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div className="w-full px-5">
      <h1 className="text-[25px] text-center font-[600] text-[#000000ba] pb-2">
      Change password
      </h1>
      <div className="w-full">
        <form
          aria-required
          onSubmit={passwordChangeHandler}
          className="flex flex-col items-center"
        >
          <div className="w-[100%] 800px:w-[50%] mt-5">
            <label className="block pb-2">Enter old password</label>
            <input
              type="password"
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="w-[100%] 800px:w-[50%] mt-2">
            <label className="block pb-2">Enter new password</label>
            <input
              type="password"
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="w-[100%] 800px:w-[50%] mt-2">
            <label className="block pb-2">Confirm Password</label>
            <input
              type="password"
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <input
              className="w-[95%] max-w-[300px] h-[40px] border-2 border-[#3a24db] bg-[#f3f0ff] text-center text-[#3a24db] rounded-[3px] mt-8 cursor-pointer font-semibold hover:bg-[#e6e0ff] hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
              required
              value="Update"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;