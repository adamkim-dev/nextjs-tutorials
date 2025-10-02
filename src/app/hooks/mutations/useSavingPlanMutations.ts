import savingPlanService from "@/app/services/savingPlanService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateSavingPlanPayload } from "@/app/models";

export const useCreateSavingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: CreateSavingPlanPayload }) =>
      savingPlanService.createSavingPlan(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["saving-plans", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};

export const useUpdateSavingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, userId }: { id: string; payload: Partial<CreateSavingPlanPayload>; userId: string }) =>
      savingPlanService.updateSavingPlan(id, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["saving-plans", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};

export const useDeleteSavingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      savingPlanService.deleteSavingPlan(id),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["saving-plans", userId] });
      queryClient.invalidateQueries({ queryKey: ["saving-planner-summary", userId] });
    },
  });
};