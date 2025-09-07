import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchTrips } from '../redux/slices/tripSlice';

const useTrips = () => {
  const dispatch = useAppDispatch();
  const { trips, status, error } = useAppSelector((state) => state.trips);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTrips());
    }
  }, [status, dispatch]);

  const refetch = () => {
    dispatch(fetchTrips());
  };

  return {
    data: trips,
    isLoading: status === 'loading',
    isError: status === 'failed',
    error,
    refetch,
  };
};

export default useTrips;