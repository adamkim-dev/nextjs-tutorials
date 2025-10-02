import loanService from "@/app/services/loanService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateLoanPayload } from "@/app/models";

export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: CreateLoanPayload }) =>
      loanService.createLoan(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["loans", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};

export const useUpdateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, userId }: { id: string; payload: Partial<CreateLoanPayload>; userId: string }) =>
      loanService.updateLoan(id, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["loans", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};

export const useDeleteLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      loanService.deleteLoan(id),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["loans", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};