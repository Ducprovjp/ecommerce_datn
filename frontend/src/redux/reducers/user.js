import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  addressloading: false,
  successMessage: null,
  usersLoading: false,
  users: null,
};

export const userReducer = createReducer(initialState, {
  LoadUserRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  LoadUserSuccess: (state, action) => {
    state.isAuthenticated = true;
    state.isLoading = false;
    state.user = action.payload.user;
    state.error = null;
  },
  LoadUserFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload.error;
    state.isAuthenticated = false;
    state.user = null;
  },
  // update user information
  updateUserInfoRequest: (state) => {
    state.isLoading = true;
  },
  updateUserInfoSuccess: (state, action) => {
    state.isLoading = false;
    state.user = action.payload;
  },
  updateUserInfoFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  // Update User address
  updateUserAddressRequest: (state) => {
    state.addressloading = true;
  },
  updateUserAddressSuccess: (state, action) => {
    state.addressloading = false;
    state.successMessage = action.payload.successMessage;
    state.user = action.payload.user;
  },
  updateUserAddressFailed: (state, action) => {
    state.addressloading = false;
    state.error = action.payload;
  },
  // delete user address
  deleteUserAddressRequest: (state) => {
    state.addressloading = true;
  },
  deleteUserAddressSuccess: (state, action) => {
    state.addressloading = false;
    state.successMessage = action.payload.successMessage;
    state.user = action.payload.user;
  },
  deleteUserAddressFailed: (state, action) => {
    state.addressloading = false;
    state.error = action.payload;
  },
  // get all users --- admin
  getAllUsersRequest: (state) => {
    state.usersLoading = true;
  },
  getAllUsersSuccess: (state, action) => {
    state.usersLoading = false;
    state.users = action.payload;
  },
  getAllUsersFailed: (state, action) => {
    state.usersLoading = false;
    state.error = action.payload;
  },
  // logout user
  LogoutUserRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  LogoutUserSuccess: (state) => {
    state.isLoading = false;
    state.isAuthenticated = false;
    state.user = null;
    state.error = null;
  },
  LogoutUserFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  clearErrors: (state) => {
    state.error = null;
  },
});