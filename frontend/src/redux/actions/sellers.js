import { getRequest } from "../../request/api";

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