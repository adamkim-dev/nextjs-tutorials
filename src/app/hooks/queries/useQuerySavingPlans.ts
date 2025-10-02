import savingPlanService from "@/app/services/savingPlanService";
import { useQuery } from "@tanstack/react-query";

const useQuerySavingPlans = (userId: string) => {
  const savingPlansQuery = useQuery({
    queryKey: ["saving-plans", userId],
    queryFn: () =>
      savingPlanService
        .fetchAllSavingPlans(userId)
        .then((res) => {
          return res.data ?? [];
        })
        .catch(() => []),
    refetchOnMount: true,
    enabled: !!userId,
  });

  return savingPlansQuery;
};

export default useQuerySavingPlans;