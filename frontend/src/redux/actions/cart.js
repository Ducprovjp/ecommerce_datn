// redux/actions/cart.js

// add To cart
export const addTocart = (data) => async (dispatch, getState) => {
  dispatch({
    type: "addToCart",
    payload: data,
  });

  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cart));
  return data;
};

// Remove From cart
export const removeFromCart = (data) => async (dispatch, getState) => {
  dispatch({
    type: "removeFromCart",
    payload: data._id,
  });
  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cart));
  return data;
};

// Clear cart - Action mới
export const clearCart = () => async (dispatch) => {
  dispatch({
    type: "clearCart",
  });

  // Xóa cart trong localStorage
  localStorage.setItem("cartItems", JSON.stringify([]));
  localStorage.setItem("latestOrder", JSON.stringify([]));

  console.log("Cart cleared successfully");
};

// Trigger an event , and call reducer
// What is dispatch?
// The dispatch function is typically used to send messages to objects that are part of a larger application
