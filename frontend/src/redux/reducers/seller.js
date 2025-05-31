import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

export const sellerReducer = createReducer(initialState, {
  LoadSellerRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  LoadSellerSuccess: (state, action) => {
    // console.log("Payload:", action.payload);
    state.isSeller = true;
    state.isLoading = false;
    state.seller = action.payload.seller;
  },
  LoadSellerFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload.error;
    state.isSeller = false;
  },
  // get all sellers ---admin
  getAllSellersRequest: (state) => {
    state.isLoading = true;
  },
  getAllSellersSuccess: (state, action) => {
    state.isLoading = false;
    state.sellers = action.payload;
  },
  getAllSellerFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // logout seller
  logoutSellerRequest: (state) => {
    state.isLoading = true;
  },
  logoutSellerSuccess: (state) => {
    state.isLoading = false;
    state.isSeller = false;
    state.seller = null;
    // console.log("State: ", { ...state });
  },
  logoutSellerFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
});

// reducer -> logic (state change)
