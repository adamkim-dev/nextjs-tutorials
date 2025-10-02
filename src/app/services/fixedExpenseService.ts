/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { FixedExpense, CreateFixedExpensePayload } from "../models";
import { IBaseResponse } from "../model/common.model";

export class FixedExpenseService extends SplitSBClient {
  constructor() {
    super();
  }

  fetchAllFixedExpenses = async (userId: string): Promise<IBaseResponse<FixedExpense[]>> => {
    try {
      const { data, error } = await this.client
        .from("fixed_expenses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error };
      }

      const fixedExpenses = data.map((expense: any) => ({
        id: expense.id,
        userId: expense.user_id,
        name: expense.name,
        amount: expense.amount,
        frequency: expense.frequency,
        createdAt: expense.created_at,
        updatedAt: expense.updated_at,
      }));

      return {
        data: fixedExpenses,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchFixedExpenseById = async (id: string): Promise<IBaseResponse<FixedExpense>> => {
    try {
      const { data, error } = await this.client
        .from("fixed_expenses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const fixedExpense = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: fixedExpense,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createFixedExpense = async (
    userId: string,
    payload: CreateFixedExpensePayload
  ): Promise<IBaseResponse<FixedExpense>> => {
    try {
      const { data, error } = await this.client
        .from("fixed_expenses")
        .insert({
          user_id: userId,
          name: payload.name,
          amount: payload.amount,
          frequency: payload.frequency,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const fixedExpense = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: fixedExpense,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  updateFixedExpense = async (
    id: string,
    payload: Partial<CreateFixedExpensePayload>
  ): Promise<IBaseResponse<FixedExpense>> => {
    try {
      const updateData: any = {};
      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.amount !== undefined) updateData.amount = payload.amount;
      if (payload.frequency !== undefined) updateData.frequency = payload.frequency;

      const { data, error } = await this.client
        .from("fixed_expenses")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const fixedExpense = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: fixedExpense,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  deleteFixedExpense = async (id: string): Promise<IBaseResponse<boolean>> => {
    try {
      const { error } = await this.client
        .from("fixed_expenses")
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

  getTotalMonthlyFixedExpenses = async (userId: string): Promise<IBaseResponse<number>> => {
    try {
      const { data, error } = await this.client
        .from("fixed_expenses")
        .select("amount, frequency")
        .eq("user_id", userId);

      if (error) {
        return { data: null, error: error };
      }

      const total = data.reduce((sum: number, expense: any) => {
        const monthlyAmount = expense.frequency === "weekly" 
          ? expense.amount * 4.33 // Average weeks per month
          : expense.amount;
        return sum + monthlyAmount;
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

const fixedExpenseService = new FixedExpenseService();
export default fixedExpenseService;