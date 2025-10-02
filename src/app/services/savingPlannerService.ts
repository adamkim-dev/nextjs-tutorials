/* eslint-disable @typescript-eslint/no-explicit-any */
import { SplitSBClient } from "../utils/supabase/SplitSBClient";
import { SavingPlannerSummary, UpdateUserSalaryPayload } from "../models";
import { IBaseResponse } from "../model/common.model";
import fixedExpenseService from "./fixedExpenseService";
import debtService from "./debtService";
import loanService from "./loanService";
import savingPlanService from "./savingPlanService";
import dailySpendingLogService from "./dailySpendingLogService";
import userService from "./userService";

export class SavingPlannerService extends SplitSBClient {
  constructor() {
    super();
  }

  updateUserSalary = async (
    userId: string,
    payload: UpdateUserSalaryPayload
  ): Promise<IBaseResponse<boolean>> => {
    try {
      const { error } = await this.client
        .from("users")
        .update({ 
          salary: payload.salary,
          daily_allowance: 0 // Will be calculated separately
        })
        .eq("id", userId);

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

  calculateDailyAllowance = async (userId: string): Promise<IBaseResponse<number>> => {
    try {
      // Get user's salary
      const userResponse = await userService.fetchUserById(userId);
      if (userResponse.error) {
        return { data: null, error: userResponse.error };
      }
      const rawSalary = userResponse.data?.salary;
      if (rawSalary === undefined || rawSalary === null) {
        return { data: null, error: new Error("User salary not found") };
      }

      const salary = Number(rawSalary) || 0;

      // Get all the monthly totals
      const [
        fixedExpensesResponse,
        debtPaymentResponse,
        loanIncomeResponse,
        savingPlanResponse
      ] = await Promise.all([
        fixedExpenseService.getTotalMonthlyFixedExpenses(userId),
        debtService.getTotalMonthlyDebtPayment(userId),
        loanService.getTotalMonthlyLoanIncome(userId),
        savingPlanService.getTotalMonthlySavingPlan(userId, salary)
      ]);

      if (fixedExpensesResponse.error || debtPaymentResponse.error || loanIncomeResponse.error || savingPlanResponse.error) {
        return { 
          data: null, 
          error: fixedExpensesResponse.error || debtPaymentResponse.error || loanIncomeResponse.error || savingPlanResponse.error 
        };
      }

      const totalFixedExpenses = fixedExpensesResponse.data || 0;
      const totalMonthlyDebtPayment = debtPaymentResponse.data || 0;
      const totalMonthlyLoanIncome = loanIncomeResponse.data || 0;
      const totalMonthlySavingPlan = savingPlanResponse.data || 0;

      // Calculate daily allowance based on payday cycle if available
      const userFull = await userService.fetchUserById(userId);
      const payday = (userFull.data as any)?.payday as number | undefined;

      const now = new Date();
      const cycleDays = (() => {
        if (!payday || payday < 1 || payday > 31) {
          // fallback: days in month
          return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        }
        // Determine days from last payday (this or previous month) to next payday
        const todayDay = now.getDate();
        if (todayDay >= payday) {
          // cycle from this month's payday to next month's payday
          const thisMonthPayday = new Date(now.getFullYear(), now.getMonth(), payday);
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          const nextMonthPayday = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(payday, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()));
          const diffMs = nextMonthPayday.getTime() - thisMonthPayday.getTime();
          return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        } else {
          // cycle from last month's payday to this month's payday
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthPayday = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), Math.min(payday, new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate()));
          const thisMonthPayday = new Date(now.getFullYear(), now.getMonth(), payday);
          const diffMs = thisMonthPayday.getTime() - lastMonthPayday.getTime();
          return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        }
      })();

      // Include loan income in allowance calculation
      const dailyAllowance = (salary + totalMonthlyLoanIncome - totalFixedExpenses - totalMonthlyDebtPayment - totalMonthlySavingPlan) / cycleDays;

      // Update user's daily allowance in database
      await this.client
        .from("users")
        .update({ daily_allowance: Math.max(0, dailyAllowance) })
        .eq("id", userId);

      return {
        data: Math.max(0, dailyAllowance),
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  getSavingPlannerSummary = async (userId: string): Promise<IBaseResponse<SavingPlannerSummary>> => {
    try {
      // Get user's salary
      const userResponse = await userService.fetchUserById(userId);
      if (userResponse.error || (userResponse.data?.salary === undefined || userResponse.data?.salary === null)) {
        return { data: null, error: userResponse.error || new Error("User salary not found") };
      }

      const salary = Number(userResponse.data.salary) || 0;

      // Get all the data in parallel
      const [
        fixedExpensesResponse,
        debtPaymentResponse,
        loanIncomeResponse,
        savingPlanResponse,
        currentMonthSpendingResponse
      ] = await Promise.all([
        fixedExpenseService.getTotalMonthlyFixedExpenses(userId),
        debtService.getTotalMonthlyDebtPayment(userId),
        loanService.getTotalMonthlyLoanIncome(userId),
        savingPlanService.getTotalMonthlySavingPlan(userId, salary),
        dailySpendingLogService.getCurrentMonthSpending(userId)
      ]);

      // Check for errors
      if (fixedExpensesResponse.error || debtPaymentResponse.error || 
          loanIncomeResponse.error || savingPlanResponse.error || 
          currentMonthSpendingResponse.error) {
        return { 
          data: null, 
          error: fixedExpensesResponse.error || debtPaymentResponse.error || 
                 loanIncomeResponse.error || savingPlanResponse.error || 
                 currentMonthSpendingResponse.error 
        };
      }

      const totalFixedExpenses = fixedExpensesResponse.data || 0;
      const totalMonthlyDebtPayment = debtPaymentResponse.data || 0;
      const totalMonthlyLoanIncome = loanIncomeResponse.data || 0;
      const totalMonthlySavingPlan = savingPlanResponse.data || 0;
      const currentMonthSpending = currentMonthSpendingResponse.data || 0;

      // Calculate daily allowance based on payday cycle
      const userFull = await userService.fetchUserById(userId);
      const payday = (userFull.data as any)?.payday as number | undefined;
      const now = new Date();
      const cycleDays = (() => {
        if (!payday || payday < 1 || payday > 31) {
          return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        }
        const todayDay = now.getDate();
        if (todayDay >= payday) {
          const thisMonthPayday = new Date(now.getFullYear(), now.getMonth(), payday);
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          const nextMonthPayday = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(payday, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()));
          const diffMs = nextMonthPayday.getTime() - thisMonthPayday.getTime();
          return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        } else {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthPayday = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), Math.min(payday, new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate()));
          const thisMonthPayday = new Date(now.getFullYear(), now.getMonth(), payday);
          const diffMs = thisMonthPayday.getTime() - lastMonthPayday.getTime();
          return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        }
      })();
      // Include loan income in allowance calculation
      const dailyAllowance = (salary + totalMonthlyLoanIncome - totalFixedExpenses - totalMonthlyDebtPayment - totalMonthlySavingPlan) / cycleDays;

      // Calculate remaining daily budget
      // Remaining balance for the whole cycle (salary - plans/expenses - spending so far)
      const totalSpendingBudgetForCycle = Math.max(0, dailyAllowance * cycleDays);
      const remainingDailyBudget = Math.max(0, totalSpendingBudgetForCycle - currentMonthSpending);

      const summary: SavingPlannerSummary = {
        totalFixedExpenses,
        totalMonthlyDebtPayment,
        totalMonthlyLoanIncome,
        totalMonthlySavingPlan,
        dailyAllowance: Math.max(0, dailyAllowance),
        currentMonthSpending,
        remainingDailyBudget
      };

      return {
        data: summary,
        error: null,
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  recalculateUserDailyAllowance = async (userId: string): Promise<IBaseResponse<boolean>> => {
    try {
      const dailyAllowanceResponse = await this.calculateDailyAllowance(userId);
      
      if (dailyAllowanceResponse.error || typeof dailyAllowanceResponse.data !== 'number') {
        return { data: null, error: dailyAllowanceResponse.error || new Error("Failed to calculate daily allowance") };
      }

      const { error } = await this.client
        .from("users")
        .update({ daily_allowance: Math.max(0, dailyAllowanceResponse.data) })
        .eq("id", userId);

      if (error) {
        return { data: null, error };
      }

      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };
}

const savingPlannerService = new SavingPlannerService();
export default savingPlannerService;