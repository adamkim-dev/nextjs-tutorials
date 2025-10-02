/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { Debt, CreateDebtPayload } from "../models";
import { IBaseResponse } from "../model/common.model";

export class DebtService extends SplitSBClient {
  constructor() {
    super();
  }

  fetchAllDebts = async (userId: string): Promise<IBaseResponse<Debt[]>> => {
    try {
      const { data, error } = await this.client
        .from("debts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error };
      }

      const debts = data.map((debt: any) => ({
        id: debt.id,
        userId: debt.user_id,
        creditor: debt.creditor,
        amountRemaining: debt.amount_remaining,
        monthlyPayment: debt.monthly_payment,
        createdAt: debt.created_at,
        updatedAt: debt.updated_at,
      }));

      return {
        data: debts,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchDebtById = async (id: string): Promise<IBaseResponse<Debt>> => {
    try {
      const { data, error } = await this.client
        .from("debts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const debt = {
        id: data.id,
        userId: data.user_id,
        creditor: data.creditor,
        amountRemaining: data.amount_remaining,
        monthlyPayment: data.monthly_payment,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: debt,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createDebt = async (
    userId: string,
    payload: CreateDebtPayload
  ): Promise<IBaseResponse<Debt>> => {
    try {
      const { data, error } = await this.client
        .from("debts")
        .insert({
          user_id: userId,
          creditor: payload.creditor,
          amount_remaining: payload.amountRemaining,
          monthly_payment: payload.monthlyPayment,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const debt = {
        id: data.id,
        userId: data.user_id,
        creditor: data.creditor,
        amountRemaining: data.amount_remaining,
        monthlyPayment: data.monthly_payment,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: debt,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  updateDebt = async (
    id: string,
    payload: Partial<CreateDebtPayload>
  ): Promise<IBaseResponse<Debt>> => {
    try {
      const updateData: any = {};
      if (payload.creditor !== undefined) updateData.creditor = payload.creditor;
      if (payload.amountRemaining !== undefined) updateData.amount_remaining = payload.amountRemaining;
      if (payload.monthlyPayment !== undefined) updateData.monthly_payment = payload.monthlyPayment;

      const { data, error } = await this.client
        .from("debts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const debt = {
        id: data.id,
        userId: data.user_id,
        creditor: data.creditor,
        amountRemaining: data.amount_remaining,
        monthlyPayment: data.monthly_payment,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: debt,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  deleteDebt = async (id: string): Promise<IBaseResponse<boolean>> => {
    try {
      const { error } = await this.client
        .from("debts")
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

  getTotalMonthlyDebtPayment = async (userId: string): Promise<IBaseResponse<number>> => {
    try {
      const { data, error } = await this.client
        .from("debts")
        .select("monthly_payment")
        .eq("user_id", userId);

      if (error) {
        return { data: null, error: error };
      }

      const total = data.reduce((sum: number, debt: any) => sum + debt.monthly_payment, 0);

      return {
        data: total,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

const debtService = new DebtService();
export default debtService;