import { getRequest } from "../../request/api";

// get all orders of user
export const getAllOrdersOfUser = (userId) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersUserRequest",
    });

    const res = await getRequest(`/order/get-all-orders/${userId}`);
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch user orders");
    }
    dispatch({
      type: "getAllOrdersUserSuccess",
      payload: res.orders,
    });
  } catch (error) {
    console.error("Fetch user orders error:", error);
    dispatch({
      type: "getAllOrdersUserFailed",
      payload: error.message || "Failed to fetch user orders",
    });
  }
};

// Get all orders of seller
export const getAllOrdersOfShop = (shopId) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersShopRequest",
    });

    const res = await getRequest(`/order/get-seller-all-orders/${shopId}`);
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch shop orders");
    }
    dispatch({
      type: "getAllOrdersShopSuccess",
      payload: res.orders,
    });
  } catch (error) {
    console.error("Fetch shop orders error:", error);
    dispatch({
      type: "getAllOrdersShopFailed",
      payload: error.message || "Failed to fetch shop orders",
    });
  }
};

// Get all orders of shipper
export const getAllOrdersOfShipper = (shipperId) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersShipperRequest",
    });

    const res = await getRequest(`/order/get-shipper-all-orders/${shipperId}`);
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch shipper orders");
    }
    dispatch({
      type: "getAllOrdersShipperSuccess",
      payload: res.orders,
    });
  } catch (error) {
    console.error("Fetch shipper orders error:", error);
    dispatch({
      type: "getAllOrdersShipperFailed",
      payload: error.message || "Failed to fetch shipper orders",
    });
  }
};

// get all orders of Admin
export const getAllOrdersOfAdmin = () => async (dispatch) => {
  try {
    dispatch({
      type: "adminAllOrdersRequest",
    });

    const res = await getRequest("/order/admin-all-orders");
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch admin orders");
    }
    dispatch({
      type: "adminAllOrdersSuccess",
      payload: res.orders,
    });
  } catch (error) {
    console.error("Fetch admin orders error:", error);
    dispatch({
      type: "adminAllOrdersFailed",
      payload: error.message || "Failed to fetch admin orders",
    });
  }
};