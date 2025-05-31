import { getRequest, postRequest, deleteRequest } from "../../request/api";

// get all shippers --- admin
export const getAllShippers = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllShippersRequest" });

    const res = await getRequest("/shipper/admin-all-shippers");
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch shippers");
    }
    dispatch({
      type: "getAllShippersSuccess",
      payload: res.shippers,
    });
  } catch (error) {
    console.error("Fetch shippers error:", error);
    dispatch({
      type: "getAllShippersFailed",
      payload: error.message || "Failed to fetch shippers",
    });
  }
};

// update delivered area
export const updateShipperDeliveredArea = (province, district, ward) => async (dispatch) => {
  try {
    dispatch({ type: "updateShipperDeliveredAreaRequest" });

    const res = await postRequest("/shipper/update-shipper-delivered-area", {
      province,
      district,
      ward,
    });
    if (!res.success) {
      throw new Error(res.message || "Failed to update shipper delivered area");
    }
    dispatch({
      type: "updateShipperDeliveredAreaSuccess",
      payload: {
        successMessage: "Shipper delivered area updated successfully!",
        shipper: res.shipper,
      },
    });
  } catch (error) {
    console.error("Update shipper delivered area error:", error);
    dispatch({
      type: "updateShipperDeliveredAreaFailed",
      payload: error.message || "Failed to update shipper delivered area",
    });
  }
};

// delete delivered area
export const deleteShipperDeliveredArea = (id) => async (dispatch) => {
  try {
    dispatch({ type: "deleteShipperDeliveredAreaRequest" });

    const res = await deleteRequest(`/shipper/delete-shipper-delivered-area/${id}`);
    if (!res.success) {
      throw new Error(res.message || "Failed to delete shipper delivered area");
    }
    dispatch({
      type: "deleteShipperDeliveredAreaSuccess",
      payload: {
        successMessage: "Delivered area deleted successfully!",
        shipper: res.shipper,
      },
    });
  } catch (error) {
    console.error("Delete shipper delivered area error:", error);
    dispatch({
      type: "deleteShipperDeliveredAreaFailed",
      payload: error.message || "Failed to delete shipper delivered area",
    });
  }
};

// logout shipper
export const logoutShipper = () => async (dispatch) => {
  try {
    dispatch({ type: "logoutShipperRequest" });
    const refreshToken = localStorage.getItem("shipper_refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }
    const res = await postRequest("/shipper/logout", { refreshToken });
    if (!res.success) {
      throw new Error(res.message || "Failed to logout");
    }
    localStorage.removeItem("shipper_accessToken");
    localStorage.removeItem("shipper_refreshToken");
    localStorage.removeItem("role");
    dispatch({
      type: "logoutShipperSuccess",
    });
  } catch (error) {
    console.error("Logout error:", error);
    dispatch({
      type: "logoutShipperFailed",
      payload: error.message || "Failed to logout",
    });
  }
};