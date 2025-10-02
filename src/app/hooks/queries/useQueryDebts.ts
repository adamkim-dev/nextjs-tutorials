import debtService from "@/app/services/debtService";
import { useQuery } from "@tanstack/react-query";

const useQueryDebts = (userId: string) => {
  const debtsQuery = useQuery({
    queryKey: ["debts", userId],
    queryFn: () =>
      debtService
        .fetchAllDebts(userId)
        .then((res) => {
          return res.data ?? [];
        })
        .catch(() => []),
    refetchOnMount: true,
    enabled: !!userId,
  });

  return debtsQuery;
};

export default useQueryDebts;