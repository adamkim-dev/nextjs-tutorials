/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { SavingPlan, CreateSavingPlanPayload } from "../models";
import { IBaseResponse } from "../model/common.model";

export class SavingPlanService extends SplitSBClient {
  constructor() {
    super();
  }

  fetchAllSavingPlans = async (userId: string): Promise<IBaseResponse<SavingPlan[]>> => {
    try {
      const { data, error } = await this.client
        .from("saving_plans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error };
      }

      const savingPlans = data.map((plan: any) => ({
        id: plan.id,
        userId: plan.user_id,
        type: plan.type,
        percentageOfSalary: plan.percentage_of_salary,
        fixedAmount: plan.fixed_amount,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
      }));

      return {
        data: savingPlans,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchSavingPlanById = async (id: string): Promise<IBaseResponse<SavingPlan>> => {
    try {
      const { data, error } = await this.client
        .from("saving_plans")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const savingPlan = {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        percentageOfSalary: data.percentage_of_salary,
        fixedAmount: data.fixed_amount,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: savingPlan,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createSavingPlan = async (
    userId: string,
    payload: CreateSavingPlanPayload
  ): Promise<IBaseResponse<SavingPlan>> => {
    try {
      const { data, error } = await this.client
        .from("saving_plans")
        .insert({
          user_id: userId,
          type: payload.type,
          percentage_of_salary: payload.percentageOfSalary,
          fixed_amount: payload.fixedAmount,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const savingPlan = {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        percentageOfSalary: data.percentage_of_salary,
        fixedAmount: data.fixed_amount,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: savingPlan,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  updateSavingPlan = async (
    id: string,
    payload: Partial<CreateSavingPlanPayload>
  ): Promise<IBaseResponse<SavingPlan>> => {
    try {
      const updateData: any = {};
      if (payload.type !== undefined) updateData.type = payload.type;
      if (payload.percentageOfSalary !== undefined) updateData.percentage_of_salary = payload.percentageOfSalary;
      if (payload.fixedAmount !== undefined) updateData.fixed_amount = payload.fixedAmount;

      const { data, error } = await this.client
        .from("saving_plans")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const savingPlan = {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        percentageOfSalary: data.percentage_of_salary,
        fixedAmount: data.fixed_amount,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: savingPlan,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  deleteSavingPlan = async (id: string): Promise<IBaseResponse<boolean>> => {
    try {
      const { error } = await this.client
        .from("saving_plans")
        .delete()
        .eq("id", id);

      if (error) {
        return { data: null, error: error };
      }

      return {
        data: true,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  getTotalMonthlySavingPlan = async (userId: string, salary: number): Promise<IBaseResponse<number>> => {
    try {
      const { data, error } = await this.client
        .from("saving_plans")
        .select("percentage_of_salary, fixed_amount")
        .eq("user_id", userId);

      if (error) {
        return { data: null, error: error };
      }

      const total = data.reduce((sum: number, plan: any) => {
        if (plan.percentage_of_salary) {
          return sum + (salary * plan.percentage_of_salary / 100);
        } else if (plan.fixed_amount) {
          return sum + plan.fixed_amount;
        }
        return sum;
      }, 0);

      return {
        data: total,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

const savingPlanService = new SavingPlanService();
export default savingPlanService;