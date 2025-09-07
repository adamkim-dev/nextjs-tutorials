import { configureStore } from "@reduxjs/toolkit";
import tripReducer from "../slices/tripSlice";

export const store = configureStore({
  reducer: {
    trips: tripReducer,
    // Thêm các reducer khác nếu cần
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
