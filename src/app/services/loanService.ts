/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { Loan, CreateLoanPayload } from "../models";
import { IBaseResponse } from "../model/common.model";

export class LoanService extends SplitSBClient {
  constructor() {
    super();
  }

  fetchAllLoans = async (userId: string): Promise<IBaseResponse<Loan[]>> => {
    try {
      const { data, error } = await this.client
        .from("loans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error };
      }

      const loans = data.map((loan: any) => ({
        id: loan.id,
        userId: loan.user_id,
        borrower: loan.borrower,
        amountRemaining: loan.amount_remaining,
        monthlyCollect: loan.monthly_collect,
        createdAt: loan.created_at,
        updatedAt: loan.updated_at,
      }));

      return {
        data: loans,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchLoanById = async (id: string): Promise<IBaseResponse<Loan>> => {
    try {
      const { data, error } = await this.client
        .from("loans")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const loan = {
        id: data.id,
        userId: data.user_id,
        borrower: data.borrower,
        amountRemaining: data.amount_remaining,
        monthlyCollect: data.monthly_collect,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: loan,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createLoan = async (
    userId: string,
    payload: CreateLoanPayload
  ): Promise<IBaseResponse<Loan>> => {
    try {
      const { data, error } = await this.client
        .from("loans")
        .insert({
          user_id: userId,
          borrower: payload.borrower,
          amount_remaining: payload.amountRemaining,
          monthly_collect: payload.monthlyCollect,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const loan = {
        id: data.id,
        userId: data.user_id,
        borrower: data.borrower,
        amountRemaining: data.amount_remaining,
        monthlyCollect: data.monthly_collect,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: loan,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  updateLoan = async (
    id: string,
    payload: Partial<CreateLoanPayload>
  ): Promise<IBaseResponse<Loan>> => {
    try {
      const updateData: any = {};
      if (payload.borrower !== undefined) updateData.borrower = payload.borrower;
      if (payload.amountRemaining !== undefined) updateData.amount_remaining = payload.amountRemaining;
      if (payload.monthlyCollect !== undefined) updateData.monthly_collect = payload.monthlyCollect;

      const { data, error } = await this.client
        .from("loans")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const loan = {
        id: data.id,
        userId: data.user_id,
        borrower: data.borrower,
        amountRemaining: data.amount_remaining,
        monthlyCollect: data.monthly_collect,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: loan,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  deleteLoan = async (id: string): Promise<IBaseResponse<boolean>> => {
    try {
      const { error } = await this.client
        .from("loans")
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

  getTotalMonthlyLoanIncome = async (userId: string): Promise<IBaseResponse<number>> => {
    try {
      const { data, error } = await this.client
        .from("loans")
        .select("monthly_collect")
        .eq("user_id", userId);

      if (error) {
        return { data: null, error: error };
      }

      const total = data.reduce((sum: number, loan: any) => sum + loan.monthly_collect, 0);

      return {
        data: total,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

const loanService = new LoanService();
export default loanService;