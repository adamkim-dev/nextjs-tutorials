import { NextRequest, NextResponse } from 'next/server';
import savingPlannerService from '@/app/services/savingPlannerService';
import userService from '@/app/services/userService';
import fixedExpenseService from '@/app/services/fixedExpenseService';
import debtService from '@/app/services/debtService';
import loanService from '@/app/services/loanService';
import savingPlanService from '@/app/services/savingPlanService';
import dailySpendingLogService from '@/app/services/dailySpendingLogService';

export async function GET(_request: NextRequest) {
  try {
    // Fetch base users
    const usersRes = await userService.fetchAllUsers();
    if (usersRes.error || !usersRes.data) {
      return NextResponse.json(
        { error: usersRes.error?.message || 'Failed to fetch users' },
        { status: 500 }
      );
    }

    const users = usersRes.data;

    // Aggregate finance per user
    const enriched = await Promise.all(
      users.map(async (u) => {
        const [
          summaryRes,
          fixedExpRes,
          debtPayRes,
          loanIncRes,
          savingPlanRes,
          monthSpendRes,
        ] = await Promise.all([
          savingPlannerService.getSavingPlannerSummary(u.id),
          fixedExpenseService.getTotalMonthlyFixedExpenses(u.id),
          debtService.getTotalMonthlyDebtPayment(u.id),
          loanService.getTotalMonthlyLoanIncome(u.id),
          savingPlanService.getTotalMonthlySavingPlan(u.id, (await userService.fetchUserById(u.id)).data?.salary || 0),
          dailySpendingLogService.getCurrentMonthSpending(u.id),
        ]);

        // Best-effort aggregation; do not fail whole response
        const finance = {
          salary: (await userService.fetchUserById(u.id)).data?.salary || 0,
          dailyAllowance: summaryRes.data?.dailyAllowance ?? 0,
          totalFixedExpenses: fixedExpRes.data ?? 0,
          totalMonthlyDebtPayment: debtPayRes.data ?? 0,
          totalMonthlyLoanIncome: loanIncRes.data ?? 0,
          totalMonthlySavingPlan: savingPlanRes.data ?? 0,
          currentMonthSpending: monthSpendRes.data ?? 0,
          remainingDailyBudget: summaryRes.data?.remainingDailyBudget ?? 0,
        };

        return { ...u, finance };
      })
    );

    return NextResponse.json({ data: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}