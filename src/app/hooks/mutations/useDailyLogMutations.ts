import dailySpendingLogService from "@/app/services/dailySpendingLogService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateDailySpendingLogPayload } from "@/app/models";

export const useCreateDailyLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: CreateDailySpendingLogPayload }) =>
      dailySpendingLogService.createDailySpendingLog(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};

export const useUpdateDailyLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, userId }: { id: string; payload: Partial<CreateDailySpendingLogPayload>; userId: string }) =>
      dailySpendingLogService.updateDailySpendingLog(id, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};

export const useUpsertDailyLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: CreateDailySpendingLogPayload }) =>
      dailySpendingLogService.upsertDailySpendingLog(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};

export const useDeleteDailyLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      dailySpendingLogService.deleteDailySpendingLog(id),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["daily-logs", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};