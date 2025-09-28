/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Activity } from "@/app/models";
import activityService from "@/app/services/activityService";
import { IBaseResponse } from "@/app/model/common.model";

interface ActivityState {
  activities: Activity[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  activityDetail: Activity | null;
}

const initialState: ActivityState = {
  activities: [],
  status: "idle",
  error: null,
  activityDetail: null,
};

export const fetchActivities = createAsyncThunk(
  "activities/fetchActivities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await activityService.fetchAllActivities();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchActivitiesByTripId = createAsyncThunk(
  "activities/fetchActivitiesByTripId",
  async (tripId: string, { rejectWithValue }) => {
    try {
      const response = await activityService.fetchActivitiesByTripId(tripId);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchActivityById = createAsyncThunk(
  "activities/fetchActivityById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await activityService.fetchActivityById(id);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const activitySlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    setActivityDetail: (state, action: PayloadAction<Activity | null>) => {
      state.activityDetail = action.payload;
    },
    clearActivityDetail: (state) => {
      state.activityDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchActivities.fulfilled,
        (state, action: PayloadAction<Activity[] | null>) => {
          state.status = "succeeded";
          state.activities = action.payload || [];
        }
      )
      .addCase(fetchActivities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchActivitiesByTripId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchActivitiesByTripId.fulfilled,
        (state, action: PayloadAction<Activity[] | null>) => {
          state.status = "succeeded";
          state.activities = action.payload || [];
        }
      )
      .addCase(fetchActivitiesByTripId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchActivityById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchActivityById.fulfilled,
        (state, action: PayloadAction<Activity | null>) => {
          state.status = "succeeded";
          state.activityDetail = action.payload || null;
        }
      )
      .addCase(fetchActivityById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { setActivityDetail, clearActivityDetail } = activitySlice.actions;

export default activitySlice.reducer;