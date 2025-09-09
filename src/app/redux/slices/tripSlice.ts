/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Trip } from "@/app/models";
import tripService from "@/app/services/tripService";
import { IBaseResponse } from "@/app/model/common.model";

interface TripState {
  trips: Trip[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TripState = {
  trips: [],
  status: "idle",
  error: null,
};

export const fetchTrips = createAsyncThunk(
  "trips/fetchTrips",
  async (_, { rejectWithValue }) => {
    try {
      const response = await tripService.fetchAllTrips();
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const tripSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchTrips.fulfilled,
        (state, action: PayloadAction<Trip[] | null>) => {
          state.status = "succeeded";
          state.trips = action.payload || [];
        }
      )
      .addCase(fetchTrips.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default tripSlice.reducer;
