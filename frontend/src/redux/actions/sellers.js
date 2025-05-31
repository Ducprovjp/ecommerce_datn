import { getRequest, postRequest } from "../../request/api";

// get all sellers --- admin
export const getAllSellers = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllSellersRequest" });

    const res = await getRequest("/shop/admin-all-sellers");
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch sellers");
    }
    dispatch({
      type: "getAllSellersSuccess",
      payload: res.sellers,
    });
  } catch (error) {
    console.error("Fetch sellers error:", error);
    dispatch({
      type: "getAllSellersFailed",
      payload: error.message || "Failed to fetch sellers",
    });
  }
};

//logout seller
export const logoutSeller = () => async (dispatch) => {
  try {
    dispatch({ type: "logoutSellerRequest" });
    const refreshToken = localStorage.getItem("seller_refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }
    const res = await postRequest("/shop/logout", { refreshToken });
    if (!res.success) {
      throw new Error(res.message || "Failed to logout");
    }
    localStorage.removeItem("seller_accessToken");
    localStorage.removeItem("seller_refreshToken");
    localStorage.removeItem("role");
    dispatch({
      type: "logoutSellerSuccess",
    });
  } catch (error) {
    console.error("Logout error:", error);
    dispatch({
      type: "logoutSellerFailed",
      payload: error.message || "Failed to logout",
    });
  }
};