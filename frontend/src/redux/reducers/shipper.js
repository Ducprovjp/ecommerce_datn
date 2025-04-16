import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

export const shipperReducer = createReducer(initialState, {
  LoadShipperRequest: (state) => {
    state.isLoading = true;
  },
  LoadShipperSuccess: (state, action) => {
    state.isShipper = true;
    state.isLoading = false;
    state.shipper = action.payload;
  },
  LoadShipperFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.isShipper = false;
  },

  // update shipper delivered area
  updateShipperDeliveredAreaRequest: (state) => {
    state.deliveredLoading = true;
  },
  updateShipperDeliveredAreaSuccess: (state, action) => {
    state.deliveredLoading = false;
    state.successMessage = action.payload.successMessage;
    state.shipper = action.payload.shipper;
  },
  updateShipperDeliveredAreaFailed: (state, action) => {
    state.deliveredLoading = false;
    state.error = action.payload;
  },

  // delete user address
  deleteShipperDeliveredAreaRequest: (state) => {
    state.deliveredLoading = true;
  },
  deleteShipperDeliveredAreaSuccess: (state, action) => {
    state.deliveredLoading = false;
    state.successMessage = action.payload.successMessage;
    state.shipper = action.payload.shipper;
  },
  deleteShipperDeliveredAreaFailed: (state, action) => {
    state.deliveredLoading = false;
    state.error = action.payload;
  },

  // get all shippers ---admin
  getAllShippersRequest: (state) => {
    state.isLoading = true;
  },
  getAllShippersSuccess: (state, action) => {
    state.isLoading = false;
    state.shippers = action.payload;
  },
  getAllShippersFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
});
