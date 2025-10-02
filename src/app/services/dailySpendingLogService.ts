/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { DailySpendingLog, CreateDailySpendingLogPayload } from "../models";
import { IBaseResponse } from "../model/common.model";

export class DailySpendingLogService extends SplitSBClient {
  constructor() {
    super();
  }

  fetchAllDailySpendingLogs = async (userId: string): Promise<IBaseResponse<DailySpendingLog[]>> => {
    try {
      const { data, error } = await this.client
        .from("daily_spending_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) {
        return { data: null, error: error };
      }

      const logs = data.map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        date: log.date,
        amountSpent: log.amount_spent,
        createdAt: log.created_at,
        updatedAt: log.updated_at,
      }));

      return {
        data: logs,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchDailySpendingLogById = async (id: string): Promise<IBaseResponse<DailySpendingLog>> => {
    try {
      const { data, error } = await this.client
        .from("daily_spending_logs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const log = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        amountSpent: data.amount_spent,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: log,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  fetchDailySpendingLogByDate = async (userId: string, date: string): Promise<IBaseResponse<DailySpendingLog | null>> => {
    try {
      const { data, error } = await this.client
        .from("daily_spending_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .maybeSingle();

      if (error) {
        return { data: null, error: error };
      }

      if (!data) {
        return { data: null, error: null };
      }

      const log = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        amountSpent: data.amount_spent,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: log,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  createDailySpendingLog = async (
    userId: string,
    payload: CreateDailySpendingLogPayload
  ): Promise<IBaseResponse<DailySpendingLog>> => {
    try {
      const { data, error } = await this.client
        .from("daily_spending_logs")
        .insert({
          user_id: userId,
          date: payload.date,
          amount_spent: payload.amountSpent,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const log = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        amountSpent: data.amount_spent,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: log,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  updateDailySpendingLog = async (
    id: string,
    payload: Partial<CreateDailySpendingLogPayload>
  ): Promise<IBaseResponse<DailySpendingLog>> => {
    try {
      const updateData: any = {};
      if (payload.date !== undefined) updateData.date = payload.date;
      if (payload.amountSpent !== undefined) updateData.amount_spent = payload.amountSpent;

      const { data, error } = await this.client
        .from("daily_spending_logs")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const log = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        amountSpent: data.amount_spent,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: log,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  upsertDailySpendingLog = async (
    userId: string,
    payload: CreateDailySpendingLogPayload
  ): Promise<IBaseResponse<DailySpendingLog>> => {
    try {
      const { data, error } = await this.client
        .from("daily_spending_logs")
        .upsert({
          user_id: userId,
          date: payload.date,
          amount_spent: payload.amountSpent,
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error };
      }

      const log = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        amountSpent: data.amount_spent,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: log,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  deleteDailySpendingLog = async (id: string): Promise<IBaseResponse<boolean>> => {
    try {
      const { error } = await this.client
        .from("daily_spending_logs")
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

  getCurrentMonthSpending = async (userId: string): Promise<IBaseResponse<number>> => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data, error } = await this.client
        .from("daily_spending_logs")
        .select("amount_spent")
        .eq("user_id", userId)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth);

      if (error) {
        return { data: null, error: error };
      }

      const total = data.reduce((sum: number, log: any) => sum + log.amount_spent, 0);

      return {
        data: total,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  getSpendingByDateRange = async (
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<IBaseResponse<DailySpendingLog[]>> => {
    try {
      const { data, error } = await this.client
        .from("daily_spending_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) {
        return { data: null, error: error };
      }

      const logs = data.map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        date: log.date,
        amountSpent: log.amount_spent,
        createdAt: log.created_at,
        updatedAt: log.updated_at,
      }));

      return {
        data: logs,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

const dailySpendingLogService = new DailySpendingLogService();
export default dailySpendingLogService;