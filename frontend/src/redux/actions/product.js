// product.js (Redux Action)
import { deleteRequest, getRequest, putFormDataRequest, uploadFileRequest } from "../../request/api";

export const createProduct = (formData) => async (dispatch) => {
  try {
    dispatch({ type: "productCreateRequest" });

    // Sử dụng uploadFileRequest để gửi FormData
    const res = await uploadFileRequest("/product/create-product", formData);
    
    if (!res.success) {
      throw new Error(res.message || "Failed to create product");
    }
    
    dispatch({
      type: "productCreateSuccess",
      payload: res.product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    dispatch({
      type: "productCreateFail",
      payload: error.message || "Failed to create product",
    });
  }
};

export const updateProduct = (id, updatedFormData) => async (dispatch) => {
  try {
    dispatch({ type: "updateProductRequest" });

    // Sử dụng putFormDataRequest để gửi FormData
    const res = await putFormDataRequest(`/product/update-product/${id}`, updatedFormData);
    
    if (!res.success) {
      throw new Error(res.message || "Failed to update product");
    }
    
    dispatch({
      type: "updateProductSuccess",
      payload: res.product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    dispatch({
      type: "updateProductFailed",
      payload: error.message || "Failed to update product",
    });
  }
};

export const getAllProductsShop = (id) => async (dispatch) => {
  try {
    dispatch({ type: "getAllProductsShopRequest" });

    const res = await getRequest(`/product/get-all-products-shop/${id}`);
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch shop products");
    }
    dispatch({
      type: "getAllProductsShopSuccess",
      payload: res.products,
    });
  } catch (error) {
    console.error("Fetch shop products error:", error);
    dispatch({
      type: "getAllProductsShopFailed",
      payload: error.message || "Failed to fetch shop products",
    });
  }
};

export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch({ type: "deleteProductRequest" });

    const res = await deleteRequest(`/product/delete-shop-product/${id}`);
    if (!res.success) {
      throw new Error(res.message || "Failed to delete product");
    }
    dispatch({
      type: "deleteProductSuccess",
      payload: res.message,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    dispatch({
      type: "deleteProductFailed",
      payload: error.message || "Failed to delete product",
    });
  }
};

export const getAllProducts = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllProductsRequest" });

    const res = await getRequest("/product/get-all-products");
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch all products");
    }
    dispatch({
      type: "getAllProductsSuccess",
      payload: res.products,
    });
  } catch (error) {
    console.error("Fetch all products error:", error);
    dispatch({
      type: "getAllProductsFailed",
      payload: error.message || "Failed to fetch all products",
    });
  }
};