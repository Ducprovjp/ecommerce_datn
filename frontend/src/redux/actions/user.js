import { getRequest, putRequest, deleteRequest } from "../../request/api";

// load user
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadUserRequest" });

    const res = await getRequest("/user/getuser");
    if (!res.success) {
      throw new Error(res.message || "Failed to load user");
    }
    dispatch({
      type: "LoadUserSuccess",
      payload: res.user,
    });
  } catch (error) {
    console.error("Load user error:", error);
    dispatch({
      type: "LoadUserFail",
      payload: error.message || "Failed to load user",
    });
  }
};

// load seller
export const loadSeller = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadSellerRequest" });

    const res = await getRequest("/shop/getSeller");
    if (!res.success) {
      throw new Error(res.message || "Failed to load seller");
    }
    dispatch({
      type: "LoadSellerSuccess",
      payload: res.seller,
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

    const res = await getRequest("/shipper/getShipper");
    if (!res.success) {
      throw new Error(res.message || "Failed to load shipper");
    }
    dispatch({
      type: "LoadShipperSuccess",
      payload: res.shipper,
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

// what is action in redux ?
// Trigger an event, and call reducer
// action is a plain object that contains information about an event that has occurred
// action is the only way to change the state in redux
// action is the only way to send data from the application to the store

// dispatch :- active action, (action trigger)