import { configureStore } from "@reduxjs/toolkit";
import tripReducer from "../slices/tripSlice";
import userReducer from "../slices/userSlice";
import activityReducer from "../slices/activitySlice";
import savingPlannerSetupReducer from "../slices/savingPlannerSetupSlice";

export const store = configureStore({
  reducer: {
    trips: tripReducer,
    users: userReducer,
    activities: activityReducer,
    savingPlannerSetup: savingPlannerSetupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
