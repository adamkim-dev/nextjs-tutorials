import tripService from "@/app/services/tripService";
import { useQuery } from "@tanstack/react-query";

const useQueryTrips = () => {
  const tripQuery = useQuery({
    queryKey: ["fetch-trips"],
    queryFn: () =>
      tripService
        .fetchAllTrips()
        .then((res) => {
          return res.data ?? [];
        })
        .catch(() => []),
    refetchOnMount: true,
  });

  return tripQuery;
};

export default useQueryTrips;
