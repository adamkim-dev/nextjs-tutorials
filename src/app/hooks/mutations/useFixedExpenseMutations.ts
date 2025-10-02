import fixedExpenseService from "@/app/services/fixedExpenseService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateFixedExpensePayload } from "@/app/models";

export const useCreateFixedExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: CreateFixedExpensePayload }) =>
      fixedExpenseService.createFixedExpense(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["fixed-expenses", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};

export const useUpdateFixedExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, userId }: { id: string; payload: Partial<CreateFixedExpensePayload>; userId: string }) =>
      fixedExpenseService.updateFixedExpense(id, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["fixed-expenses", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};

export const useDeleteFixedExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      fixedExpenseService.deleteFixedExpense(id),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["fixed-expenses", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};