/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchDetailTrip, fetchTrips } from "../redux/slices/tripSlice";
interface UseTripsOptions {
  tripId?: string;
}

const useTrips = (options?: UseTripsOptions) => {
  const dispatch = useAppDispatch();
  const { trips, status, error } = useAppSelector((state) => state.trips);
  const tripDetail = useAppSelector((state) => state.trips.tripDetail);

  const targetTripId = options?.tripId;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTrips());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (targetTripId) {
      dispatch(fetchDetailTrip(targetTripId));
    }
  }, [targetTripId]);

  const refetch = () => {
    dispatch(fetchTrips());
  };

  const refetchTripDetail = (tripId: string) => {
    dispatch(fetchDetailTrip(tripId));
  };

  return {
    data: trips,
    isLoading: status === "loading",
    isError: status === "failed",
    error,
    refetch,
    refetchTripDetail,
    tripDetail: options?.tripId ? tripDetail : null,
  };
};

export default useTrips;
