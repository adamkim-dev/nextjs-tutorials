import fixedExpenseService from "@/app/services/fixedExpenseService";
import { useQuery } from "@tanstack/react-query";

const useQueryFixedExpenses = (userId: string) => {
  const fixedExpensesQuery = useQuery({
    queryKey: ["fixed-expenses", userId],
    queryFn: () =>
      fixedExpenseService
        .fetchAllFixedExpenses(userId)
        .then((res) => {
          return res.data ?? [];
        })
        .catch(() => []),
    refetchOnMount: true,
    enabled: !!userId,
  });

  return fixedExpensesQuery;
};

export default useQueryFixedExpenses;