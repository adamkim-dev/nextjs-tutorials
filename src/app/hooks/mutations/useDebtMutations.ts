import debtService from "@/app/services/debtService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateDebtPayload } from "@/app/models";

export const useCreateDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: CreateDebtPayload }) =>
      debtService.createDebt(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["debts", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};

export const useUpdateDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, userId }: { id: string; payload: Partial<CreateDebtPayload>; userId: string }) =>
      debtService.updateDebt(id, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["debts", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};

export const useDeleteDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      debtService.deleteDebt(id),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["debts", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};