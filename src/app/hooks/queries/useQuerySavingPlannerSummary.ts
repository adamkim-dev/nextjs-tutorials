import savingPlannerService from "@/app/services/savingPlannerService";
import { useQuery } from "@tanstack/react-query";

const useQuerySavingPlannerSummary = (userId: string) => {
  const summaryQuery = useQuery({
    queryKey: ["saving-planner-summary", userId],
    queryFn: () =>
      savingPlannerService
        .getSavingPlannerSummary(userId)
        .then((res) => {
          return res.data;
        })
        .catch(() => null),
    refetchOnMount: true,
    enabled: !!userId,
  });

  return summaryQuery;
};

export default useQuerySavingPlannerSummary;