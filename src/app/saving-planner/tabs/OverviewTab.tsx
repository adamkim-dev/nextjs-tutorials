import { Debt, Loan, SavingPlan, SavingPlannerSummary } from "../../models";

type Props = {
  summary?: SavingPlannerSummary;
  debts: Debt[];
  loans: Loan[];
  savingPlans: SavingPlan[];
  salaryInput: string;
  setSalaryInput: (v: string) => void;
  submitSalary: () => void;
  paydayInput: string;
  setPaydayInput: (v: string) => void;
  submitPayday: () => void;
  handleRecalculateAllowance: () => void;
};

export default function OverviewTab({
  summary,
  debts,
  loans,
  savingPlans,
  salaryInput,
  setSalaryInput,
  submitSalary,
  paydayInput,
  setPaydayInput,
  submitPayday,
  handleRecalculateAllowance,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-sm text-blue-600 font-medium mb-1">
            Monthly Loan Income
          </div>
          <div className="text-2xl font-bold text-blue-900">
            ${summary?.totalMonthlyLoanIncome?.toFixed(2) || "0.00"}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="text-sm text-green-600 font-medium mb-1">
            Daily Allowance
          </div>
          <div className="text-2xl font-bold text-green-900">
            ${summary?.dailyAllowance?.toFixed(2) || "0.00"}
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6">
          <div className="text-sm text-red-600 font-medium mb-1">
            Total Fixed Expenses
          </div>
          <div className="text-2xl font-bold text-red-900">
            ${summary?.totalFixedExpenses?.toFixed(2) || "0.00"}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="text-sm text-purple-600 font-medium mb-1">
            Total Monthly Saving Plan
          </div>
          <div className="text-2xl font-bold text-purple-900">
            ${summary?.totalMonthlySavingPlan?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>

      {/* Salary Setup */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Salary Setup</h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            placeholder="Enter monthly salary"
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={salaryInput}
            onChange={(e) => setSalaryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitSalary();
              }
            }}
          />
          <button
            onClick={handleRecalculateAllowance}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Recalculate Allowance
          </button>
        </div>

        {/* Payday Setup */}
        <div className="mt-4 flex items-center space-x-4">
          <input
            type="number"
            placeholder="Enter payday (1-31)"
            className="w-60 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={paydayInput}
            onChange={(e) => setPaydayInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitPayday();
              }
            }}
          />
          <button
            onClick={submitPayday}
            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Save Payday
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-700 mb-2">Active Debts</h4>
          <div className="text-2xl font-bold text-red-600">{debts.length}</div>
          <div className="text-sm text-gray-500">
            Total: $
            {debts
              .reduce((sum: number, debt: Debt) => sum + debt.amountRemaining, 0)
              .toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-700 mb-2">Active Loans</h4>
          <div className="text-2xl font-bold text-green-600">{loans.length}</div>
          <div className="text-sm text-gray-500">
            Total: $
            {loans
              .reduce((sum: number, loan: Loan) => sum + loan.amountRemaining, 0)
              .toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-700 mb-2">Saving Plans</h4>
          <div className="text-2xl font-bold text-purple-600">{savingPlans.length}</div>
          <div className="text-sm text-gray-500">Active goals</div>
        </div>
      </div>
    </div>
  );
}