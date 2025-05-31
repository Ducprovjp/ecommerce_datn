import { postRequest, getRequest, putRequest, deleteRequest } from "../../request/api";

// load user
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadUserRequest" });
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found");
    }
    const res = await getRequest("/user/getuser");
    if (!res.success) {
      throw new Error(res.message || "Failed to load user");
    }
    dispatch({
      type: "LoadUserSuccess",
      payload: { user: res.user },
    });
  } catch (error) {
    console.error("Load user error:", error);
    dispatch({
      type: "LoadUserFail",
      payload: { error: error.message || "Failed to load user" },
    });
  }
};

// load seller
export const loadSeller = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadSellerRequest" });
    const seller_accessToken = localStorage.getItem("seller_accessToken");
    if (!seller_accessToken) {
      throw new Error("No seller access token found");
    }
    const res = await getRequest("/shop/getSeller");
    if (!res.success) {
      throw new Error(res.message || "Failed to load seller");
    }
    dispatch({
      type: "LoadSellerSuccess",
      payload: { seller: res.seller },
    });
  } catch (error) {
    console.error("Load seller error:", error);
    dispatch({
      type: "LoadSellerFail",
      payload: error.message || "Failed to load seller",
    });
  }
};

// load shipper
export const loadShipper = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadShipperRequest" });
    const shipper_accessToken = localStorage.getItem("shipper_accessToken");
    if (!shipper_accessToken) {
      throw new Error("No shipper access token found");
    }
    const res = await getRequest("/shipper/getShipper");
    if (!res.success) {
      throw new Error(res.message || "Failed to load shipper");
    }
    dispatch({
      type: "LoadShipperSuccess",
      payload: {shipper: res.shipper},
    });
  } catch (error) {
    console.error("Load shipper error:", error);
    dispatch({
      type: "LoadShipperFail",
      payload: error.message || "Failed to load shipper",
    });
  }
};

// User update information
export const updateUserInformation = (name, email, phoneNumber, password) => async (dispatch) => {
  try {
    dispatch({ type: "updateUserInfoRequest" });
    const res = await putRequest("/user/update-user-info", { name, email, phoneNumber, password });
    if (!res.success) {
      throw new Error(res.message || "Failed to update user info");
    }
    dispatch({
      type: "updateUserInfoSuccess",
      payload: res.user,
    });
  } catch (error) {
    console.error("Update user info error:", error);
    dispatch({
      type: "updateUserInfoFailed",
      payload: error.message || "Failed to update user info",
    });
  }
};

// update user address
export const updateUserAddress = (province, district, ward, address1, addressType) => async (dispatch) => {
  try {
    dispatch({ type: "updateUserAddressRequest" });
    const res = await putRequest("/user/update-user-addresses", {
      province,
      district,
      ward,
      address1,
      addressType,
    });
    if (!res.success) {
      throw new Error(res.message || "Failed to update address");
    }
    dispatch({
      type: "updateUserAddressSuccess",
      payload: {
        successMessage: "User address updated successfully!",
        user: res.user,
      },
    });
  } catch (error) {
    console.error("Update user address error:", error);
    dispatch({
      type: "updateUserAddressFailed",
      payload: error.message || "Failed to update address",
    });
  }
};

// delete user address
export const deleteUserAddress = (id) => async (dispatch) => {
  try {
    dispatch({ type: "deleteUserAddressRequest" });
    const res = await deleteRequest(`/user/delete-user-address/${id}`);
    if (!res.success) {
      throw new Error(res.message || "Failed to delete address");
    }
    dispatch({
      type: "deleteUserAddressSuccess",
      payload: {
        successMessage: "Address deleted successfully!",
        user: res.user,
      },
    });
  } catch (error) {
    console.error("Delete user address error:", error);
    dispatch({
      type: "deleteUserAddressFailed",
      payload: error.message || "Failed to delete address",
    });
  }
};

// get all users --- admin
export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllUsersRequest" });
    const res = await getRequest("/user/admin-all-users");
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch users");
    }
    dispatch({
      type: "getAllUsersSuccess",
      payload: res.users,
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    dispatch({
      type: "getAllUsersFailed",
      payload: error.message || "Failed to fetch users",
    });
  }
};

// logout user
export const logoutUser = () => async (dispatch) => {
  try {
    dispatch({ type: "LogoutUserRequest" });
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }
    const res = await postRequest("/user/logout", { refreshToken });
    if (!res.success) {
      throw new Error(res.message || "Failed to logout");
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    dispatch({ type: "LogoutUserSuccess" });
  } catch (error) {
    console.error("Logout user error:", error);
    dispatch({
      type: "LogoutUserFail",
      payload: error.message || "Failed to logout",
    });
  }
};