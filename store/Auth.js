import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  user: null,
  sessionToken: null,
  firebaseInitialized: false,
  firebaseError: null,
  firstTimeVisitor: true,
  lastCashPaymentPopupTimes: {}, // Object to store timestamps keyed by job ID
};

const AuthSlice = createSlice({
  name: "Auth",
  initialState: initialState,
  reducers: {
    LoginRed(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    SetSessionToken(state, action) {
      state.sessionToken = action.payload;
    },
    UpdateUser(state, action) {
      state.user = action.payload;
    },
    LogoutRed(state) {
      state.token = null;
      state.user = null;
      state.firebaseInitialized = false;
      state.firebaseError = null;
    },
    setFirebaseInitialized(state, action) {
      state.firebaseInitialized = action.payload;
    },
    setFirebaseError(state, action) {
      state.firebaseError = action.payload;
    },
    setFirstTimeVisitor(state, action) {
      state.firstTimeVisitor = action.payload;
    },
    setCashPaymentPopupTime(state, action) {
      const { jobId, timestamp } = action.payload;
      // Ensure lastCashPaymentPopupTimes is initialized as an object
      if (!state.lastCashPaymentPopupTimes) {
        state.lastCashPaymentPopupTimes = {};
      }
      // Only set if jobId is valid
      if (jobId !== null && jobId !== undefined) {
        state.lastCashPaymentPopupTimes[jobId] = timestamp;
      }
    },
  },
});

export const {
  LoginRed,
  LogoutRed,
  SetSessionToken,
  UpdateUser,
  setFirebaseInitialized,
  setFirebaseError,
  setFirstTimeVisitor,
  setCashPaymentPopupTime,
} = AuthSlice.actions;

export default AuthSlice.reducer;
