import loanService from "@/app/services/loanService";
import { useQuery } from "@tanstack/react-query";

const useQueryLoans = (userId: string) => {
  const loansQuery = useQuery({
    queryKey: ["loans", userId],
    queryFn: () =>
      loanService
        .fetchAllLoans(userId)
        .then((res) => {
          return res.data ?? [];
        })
        .catch(() => []),
    refetchOnMount: true,
    enabled: !!userId,
  });

  return loansQuery;
};

export default useQueryLoans;