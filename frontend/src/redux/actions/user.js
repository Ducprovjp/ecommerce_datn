import axios from "axios";

// Hàm helper để thêm header Authorization
const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

// load user
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadUserRequest" });
    const { data } = await axios.get(`${process.env.REACT_APP_SERVER}/user/getuser`, {
      headers: getAuthHeaders(),
    });
    dispatch({
      type: "LoadUserSuccess",
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: "LoadUserFail",
      payload: error.response?.data?.message || "Failed to load user",
    });
  }
};

// load seller
export const loadSeller = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadSellerRequest" });
    const { data } = await axios.get(`${process.env.REACT_APP_SERVER}/shop/getSeller`, {
      headers: getAuthHeaders(),
    });
    dispatch({
      type: "LoadSellerSuccess",
      payload: data.seller,
    });
  } catch (error) {
    dispatch({
      type: "LoadSellerFail",
      payload: error.response?.data?.message || "Failed to load seller",
    });
  }
};

// load shipper
export const loadShipper = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadShipperRequest" });
    const { data } = await axios.get(`${process.env.REACT_APP_SERVER}/shipper/getShipper`, {
      headers: getAuthHeaders(),
    });
    dispatch({
      type: "LoadShipperSuccess",
      payload: data.shipper,
    });
  } catch (error) {
    dispatch({
      type: "LoadShipperFail",
      payload: error.response?.data?.message || "Failed to load shipper",
    });
  }
};

// User update information
export const updateUserInformation = (name, email, phoneNumber, password) => async (dispatch) => {
  try {
    dispatch({ type: "updateUserInfoRequest" });
    const { data } = await axios.put(
      `${process.env.REACT_APP_SERVER}/user/update-user-info`,
      { name, email, phoneNumber, password },
      { headers: getAuthHeaders() }
    );
    dispatch({
      type: "updateUserInfoSuccess",
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: "updateUserInfoFailed",
      payload: error.response?.data?.message || "Failed to update user info",
    });
  }
};

// update user address
export const updateUserAddress = (province, district, ward, address1, addressType) => async (dispatch) => {
  try {
    dispatch({ type: "updateUserAddressRequest" });
    const { data } = await axios.put(
      `${process.env.REACT_APP_SERVER}/user/update-user-addresses`,
      { province, district, ward, address1, addressType },
      { headers: getAuthHeaders() }
    );
    dispatch({
      type: "updateUserAddressSuccess",
      payload: {
        successMessage: "User address updated succesfully!",
        user: data.user,
      },
    });
  } catch (error) {
    dispatch({
      type: "updateUserAddressFailed",
      payload: error.response?.data?.message || "Failed to update address",
    });
  }
};

// delete user address
export const deleteUserAddress = (id) => async (dispatch) => {
  try {
    dispatch({ type: "deleteUserAddressRequest" });
    const { data } = await axios.delete(
      `${process.env.REACT_APP_SERVER}/user/delete-user-address/${id}`,
      { headers: getAuthHeaders() }
    );
    dispatch({
      type: "deleteUserAddressSuccess",
      payload: {
        successMessage: "Address deleted successfully!",
        user: data.user,
      },
    });
  } catch (error) {
    dispatch({
      type: "deleteUserAddressFailed",
      payload: error.response?.data?.message || "Failed to delete address",
    });
  }
};

// get all users --- admin
export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllUsersRequest" });
    const { data } = await axios.get(`${process.env.REACT_APP_SERVER}/user/admin-all-users`, {
      headers: getAuthHeaders(),
    });
    dispatch({
      type: "getAllUsersSuccess",
      payload: data.users,
    });
  } catch (error) {
    dispatch({
      type: "getAllUsersFailed",
      payload: error.response?.data?.message || "Failed to load users",
    });
  }
};

// what is action in redux ?
// Trigger an event , and call reducer
// action is a plain object that contains information about an event that has occurred
// action is the only way to change the state in redux
// action is the only way to send data from the application to the store

// dispatch :- active action , (action trigger)
