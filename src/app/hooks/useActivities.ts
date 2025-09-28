/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchActivities, fetchActivitiesByTripId, fetchActivityById } from "../redux/slices/activitySlice";

interface UseActivitiesOptions {
  tripId?: string;
  activityId?: string;
}

const useActivities = (options?: UseActivitiesOptions) => {
  const dispatch = useAppDispatch();
  const { activities, status, error, activityDetail } = useAppSelector((state) => state.activities);

  const targetTripId = options?.tripId;
  const targetActivityId = options?.activityId;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchActivities());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (targetTripId) {
      dispatch(fetchActivitiesByTripId(targetTripId));
    }
  }, [targetTripId]);

  useEffect(() => {
    if (targetActivityId) {
      dispatch(fetchActivityById(targetActivityId));
    }
  }, [targetActivityId]);

  const refetch = () => {
    dispatch(fetchActivities());
  };

  const refetchActivitiesByTripId = (tripId: string) => {
    dispatch(fetchActivitiesByTripId(tripId));
  };

  const refetchActivityById = (activityId: string) => {
    dispatch(fetchActivityById(activityId));
  };

  return {
    data: activities,
    isLoading: status === "loading",
    isError: status === "failed",
    error,
    refetch,
    refetchActivitiesByTripId,
    refetchActivityById,
    activityDetail: targetActivityId ? activityDetail : null,
  };
};

export default useActivities;