import savingPlannerService from "@/app/services/savingPlannerService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateUserSalaryPayload } from "@/app/models";

export const useUpdateUserSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserSalaryPayload }) =>
      savingPlannerService.updateUserSalary(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });
};

export const useRecalculateDailyAllowance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      savingPlannerService.recalculateUserDailyAllowance(userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });
};