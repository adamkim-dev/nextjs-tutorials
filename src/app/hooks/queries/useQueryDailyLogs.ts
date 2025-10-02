import dailySpendingLogService from "@/app/services/dailySpendingLogService";
import { useQuery } from "@tanstack/react-query";

const useQueryDailyLogs = (userId: string, date?: string) => {
  const dailyLogsQuery = useQuery({
    queryKey: ["daily-logs", userId, date],
    queryFn: () => {
      if (date) {
        return dailySpendingLogService
          .fetchDailySpendingLogByDate(userId, date)
          .then((res) => {
            return res.data ? [res.data] : [];
          })
          .catch(() => []);
      } else {
        return dailySpendingLogService
          .fetchAllDailySpendingLogs(userId)
          .then((res) => {
            return res.data ?? [];
          })
          .catch(() => []);
      }
    },
    refetchOnMount: true,
    enabled: !!userId,
  });

  return dailyLogsQuery;
};

export default useQueryDailyLogs;