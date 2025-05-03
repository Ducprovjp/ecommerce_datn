import axios from "axios";

// create product
export const createProduct = (newForm) => async (dispatch) => {
  try {
    dispatch({
      type: "productCreateRequest",
    });

    const config = { headers: { "Content-Type": "multipart/form-data" } };

    const { data } = await axios.post(
      `${process.env.REACT_APP_SERVER}/product/create-product`,
      newForm,
      config
    );
    dispatch({
      type: "productCreateSuccess",
      payload: data.product,
    });
  } catch (error) {
    dispatch({
      type: "productCreateFail",
      payload: error.response.data.message,
    });
  }
};

// update product of a shop
export const updateProduct = (id, updatedFormData) => async (dispatch) => {
  try {
    dispatch({ type: "updateProductRequest" });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    };

    const { data } = await axios.put(
      `${process.env.REACT_APP_SERVER}/product/update-product/${id}`,
      updatedFormData,
      config
    );

    dispatch({
      type: "updateProductSuccess",
      payload: data.product,
    });
  } catch (error) {
    dispatch({
      type: "updateProductFailed",
      payload: error.response.data.message,
    });
  }
};

// get All Products of a shop
export const getAllProductsShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsShopRequest",
    });

    const { data } = await axios.get(
      `${process.env.REACT_APP_SERVER}/product/get-all-products-shop/${id}`
    );
    dispatch({
      type: "getAllProductsShopSuccess",
      payload: data.products,
    });
  } catch (error) {
    dispatch({
      type: "getAllProductsShopFailed",
      payload: error.response.data.message,
    });
  }
};

// delete product of a shop
export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteProductRequest",
    });

    const { data } = await axios.delete(
      `${process.env.REACT_APP_SERVER}/product/delete-shop-product/${id}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteProductSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteProductFailed",
      payload: error.response.data.message,
    });
  }
};

// get all products
export const getAllProducts = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsRequest",
    });

    const { data } = await axios.get(`${process.env.REACT_APP_SERVER}/product/get-all-products`);
    dispatch({
      type: "getAllProductsSuccess",
      payload: data.products,
    });
  } catch (error) {
    dispatch({
      type: "getAllProductsFailed",
      payload: error.response.data.message,
    });
  }
};
