"use client";

import { useEffect, useState } from "react";
import useQueryFixedExpenses from "../hooks/queries/useQueryFixedExpenses";
import useQueryDebts from "../hooks/queries/useQueryDebts";
import useQueryLoans from "../hooks/queries/useQueryLoans";
import useQuerySavingPlans from "../hooks/queries/useQuerySavingPlans";
import useQueryDailyLogs from "../hooks/queries/useQueryDailyLogs";
import useQuerySavingPlannerSummary from "../hooks/queries/useQuerySavingPlannerSummary";
import {
  useCreateFixedExpense,
  useUpdateFixedExpense,
  useDeleteFixedExpense,
} from "../hooks/mutations/useFixedExpenseMutations";
import {
  useCreateDebt,
  useUpdateDebt,
  useDeleteDebt,
} from "../hooks/mutations/useDebtMutations";
import {
  useCreateLoan,
  useUpdateLoan,
  useDeleteLoan,
} from "../hooks/mutations/useLoanMutations";
import {
  useCreateSavingPlan,
  useUpdateSavingPlan,
  useDeleteSavingPlan,
} from "../hooks/mutations/useSavingPlanMutations";
import { useUpsertDailyLog } from "../hooks/mutations/useDailyLogMutations";
import {
  useUpdateUserSalary,
  useRecalculateDailyAllowance,
} from "../hooks/mutations/useSavingPlannerMutations";
import {
  FixedExpense,
  Debt,
  Loan,
  SavingPlan,
  DailySpendingLog,
  SavingPlanType,
} from "../models";
import useUsers from "../hooks/useUsers";
import OverviewTab from "./tabs/OverviewTab";
import FixedExpensesTab from "./tabs/FixedExpensesTab";
import DebtsTab from "./tabs/DebtsTab";
import LoansTab from "./tabs/LoansTab";
import SavingPlansTab from "./tabs/SavingPlansTab";
import DailySpendingTab from "./tabs/DailySpendingTab";

// Fallback UUID to avoid invalid UUID errors before auth loads
const DEFAULT_USER_ID = "550e8400-e29b-41d4-a716-406655440001";

export default function SavingPlannerPage() {
  const { data: reduxUsers } = useUsers();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [salaryInput, setSalaryInput] = useState("");
  const [paydayInput, setPaydayInput] = useState("");
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  // Debts inline form state
  const [newDebtCreditor, setNewDebtCreditor] = useState("");
  const [newDebtAmountRemaining, setNewDebtAmountRemaining] = useState("");
  const [newDebtMonthlyPayment, setNewDebtMonthlyPayment] = useState("");
  // Loans inline form state
  const [newLoanBorrower, setNewLoanBorrower] = useState("");
  const [newLoanAmountRemaining, setNewLoanAmountRemaining] = useState("");
  const [newLoanMonthlyCollect, setNewLoanMonthlyCollect] = useState("");
  // Saving Plans inline form state
  const [newPlanType, setNewPlanType] = useState<
    "saving" | "send_home" | "investing"
  >("saving");
  const [usePlanPercentage, setUsePlanPercentage] = useState(true);
  const [newPlanPercentage, setNewPlanPercentage] = useState("");
  const [newPlanFixedAmount, setNewPlanFixedAmount] = useState("");
  const [userId, setUserId] = useState<string>(DEFAULT_USER_ID);
  // Authentication is bypassed; we will use Redux-selected user only

  // Initialize from Redux users only
  useEffect(() => {
    if (reduxUsers && reduxUsers.length > 0) {
      // Default to the first user if none selected yet
      setUserId((prev) =>
        prev && prev !== DEFAULT_USER_ID ? prev : reduxUsers[0].id
      );
    } else {
      setUserId(DEFAULT_USER_ID);
    }
  }, [reduxUsers]);

  // Provide a simple auth-less guard: ensure a valid userId selected
  const hasValidUser = !!userId && userId !== DEFAULT_USER_ID;

  const requireAuth = () => {
    // Bypass authentication: only check a Redux user is selected
    if (!hasValidUser) {
      alert("Please select a user from Redux to continue.");
      return false;
    }
    return true;
  };

  // Queries
  const { data: fixedExpenses = [] } = useQueryFixedExpenses(userId);
  const { data: debts = [] } = useQueryDebts(userId);
  const { data: loans = [] } = useQueryLoans(userId);
  const { data: savingPlans = [] } = useQuerySavingPlans(userId);
  const { data: dailyLogs = [] } = useQueryDailyLogs(userId, selectedDate);
  const { data: allDailyLogs = [] } = useQueryDailyLogs(userId);
  const { data: summary } = useQuerySavingPlannerSummary(userId);

  // Mutations
  const createFixedExpense = useCreateFixedExpense();
  const updateFixedExpense = useUpdateFixedExpense();
  const deleteFixedExpense = useDeleteFixedExpense();

  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const deleteDebt = useDeleteDebt();

  const createLoan = useCreateLoan();
  const updateLoan = useUpdateLoan();
  const deleteLoan = useDeleteLoan();

  const createSavingPlan = useCreateSavingPlan();
  const updateSavingPlan = useUpdateSavingPlan();
  const deleteSavingPlan = useDeleteSavingPlan();

  const upsertDailyLog = useUpsertDailyLog();
  const updateUserSalary = useUpdateUserSalary();
  const recalculateDailyAllowance = useRecalculateDailyAllowance();

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "expenses", label: "Fixed Expenses", icon: "💰" },
    { id: "debts", label: "Debts", icon: "💳" },
    { id: "loans", label: "Loans", icon: "🏦" },
    { id: "savings", label: "Saving Plans", icon: "🎯" },
    { id: "daily", label: "Daily Spending", icon: "📝" },
  ];

  const handleSalaryUpdate = (newSalary: number) => {
    if (!requireAuth()) return;
    updateUserSalary.mutate({
      userId: userId,
      payload: { salary: newSalary },
    });
  };

  const handleRecalculateAllowance = () => {
    if (!requireAuth()) return;
    recalculateDailyAllowance.mutate({ userId: userId });
  };

  const submitSalary = () => {
    const value = parseFloat(salaryInput);
    if (!isNaN(value) && value >= 0) {
      handleSalaryUpdate(value);
      setSalaryInput("");
    } else {
      alert("Please enter a valid non-negative salary.");
    }
  };

  const submitPayday = async () => {
    const value = parseInt(paydayInput);
    if (!isNaN(value) && value >= 1 && value <= 31) {
      if (!requireAuth()) return;
      try {
        // Simple update via Supabase client to users table
        // Using savingPlannerService's client indirectly isn't exposed here; use a fetch to API route
        const res = await fetch(
          `/api/saving-planner/update-payday?userId=${userId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payday: value }),
          }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to update payday");
        setPaydayInput("");
        // Refresh summary after payday update
        handleRecalculateAllowance();
      } catch (e) {
        alert((e as Error).message);
      }
    } else {
      alert("Payday must be a day between 1 and 31.");
    }
  };

  const renderOverview = () => (
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
              .reduce(
                (sum: number, debt: Debt) => sum + debt.amountRemaining,
                0
              )
              .toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-700 mb-2">Active Loans</h4>
          <div className="text-2xl font-bold text-green-600">
            {loans.length}
          </div>
          <div className="text-sm text-gray-500">
            Total: $
            {loans
              .reduce(
                (sum: number, loan: Loan) => sum + loan.amountRemaining,
                0
              )
              .toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-700 mb-2">Saving Plans</h4>
          <div className="text-2xl font-bold text-purple-600">
            {savingPlans.length}
          </div>
          <div className="text-sm text-gray-500">Active goals</div>
        </div>
      </div>
    </div>
  );

  const renderFixedExpenses = () => (
    <div className="space-y-6">
      {/* Add Expense Form */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Fixed Expenses</h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Expense name"
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={newExpenseName}
            onChange={(e) => setNewExpenseName(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            className="w-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={newExpenseAmount}
            onChange={(e) => setNewExpenseAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // submit via Enter on amount
                const button = document.getElementById("add-expense-btn");
                button?.click();
              }
            }}
          />
          <button
            id="add-expense-btn"
            onClick={() => {
              if (!requireAuth()) return;
              if (!newExpenseName || !newExpenseAmount) {
                alert("Vui lòng nhập đủ tên và số tiền.");
                return;
              }
              const amt = parseFloat(newExpenseAmount);
              if (isNaN(amt) || amt < 0) {
                alert("Vui lòng nhập số tiền hợp lệ (>= 0).");
                return;
              }
              createFixedExpense.mutate({
                userId: userId,
                payload: {
                  name: newExpenseName,
                  amount: amt,
                  frequency: "monthly",
                },
              });
              setNewExpenseName("");
              setNewExpenseAmount("");
            }}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Horizontal card list */}
      <div className="space-y-3">
        {fixedExpenses.map((expense: FixedExpense) => (
          <div
            key={expense.id}
            className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
          >
            <div>
              <h4 className="font-semibold">{expense.name}</h4>
              <p className="text-lg font-bold text-red-600">
                ${expense.amount.toFixed(2)}/month
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  const newAmount = prompt(
                    "New amount:",
                    expense.amount.toString()
                  );
                  if (newAmount) {
                    const amt = parseFloat(newAmount);
                    if (!isNaN(amt) && amt >= 0) {
                      updateFixedExpense.mutate({
                        id: expense.id,
                        payload: { amount: amt },
                        userId: userId,
                      });
                    } else {
                      alert("Please enter a valid non-negative amount.");
                    }
                  }
                }}
                className="text-blue-500 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  if (confirm("Delete this expense?")) {
                    deleteFixedExpense.mutate({
                      id: expense.id,
                      userId: userId,
                    });
                  }
                }}
                className="text-red-500 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDebts = () => (
    <div className="space-y-6">
      {/* Add Debt Form */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Debts</h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Creditor name"
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={newDebtCreditor}
            onChange={(e) => setNewDebtCreditor(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount remaining"
            className="w-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={newDebtAmountRemaining}
            onChange={(e) => setNewDebtAmountRemaining(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Monthly payment"
            className="w-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={newDebtMonthlyPayment}
            onChange={(e) => setNewDebtMonthlyPayment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const btn = document.getElementById("add-debt-btn");
                btn?.click();
              }
            }}
          />
          <button
            id="add-debt-btn"
            onClick={() => {
              if (!requireAuth()) return;
              if (
                !newDebtCreditor ||
                !newDebtAmountRemaining ||
                !newDebtMonthlyPayment
              ) {
                alert(
                  "Vui lòng nhập đủ thông tin nợ (tên, số tiền, trả hàng tháng)."
                );
                return;
              }
              const amt = parseFloat(newDebtAmountRemaining);
              const mon = parseFloat(newDebtMonthlyPayment);
              if (isNaN(amt) || amt < 0 || isNaN(mon) || mon < 0) {
                alert("Vui lòng nhập số tiền hợp lệ (>= 0).");
                return;
              }
              createDebt.mutate({
                userId: userId,
                payload: {
                  creditor: newDebtCreditor,
                  amountRemaining: amt,
                  monthlyPayment: mon,
                },
              });
              setNewDebtCreditor("");
              setNewDebtAmountRemaining("");
              setNewDebtMonthlyPayment("");
            }}
            className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600"
          >
            + Add Debt
          </button>
        </div>
      </div>

      {/* Horizontal card list */}
      <div className="space-y-3">
        {debts.map((debt: Debt) => (
          <div
            key={debt.id}
            className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
          >
            <div>
              <h4 className="font-semibold">{debt.creditor}</h4>
              <p className="text-lg font-bold text-red-600">
                ${debt.amountRemaining.toFixed(2)} remaining
              </p>
              <p className="text-sm text-gray-600">
                ${debt.monthlyPayment.toFixed(2)}/month
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  const newAmount = prompt(
                    "Amount remaining:",
                    debt.amountRemaining.toString()
                  );
                  if (newAmount) {
                    const amt = parseFloat(newAmount);
                    if (!isNaN(amt) && amt >= 0) {
                      updateDebt.mutate({
                        id: debt.id,
                        payload: { amountRemaining: amt },
                        userId: userId,
                      });
                    } else {
                      alert("Please enter a valid non-negative amount.");
                    }
                  }
                }}
                className="text-blue-500 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  if (confirm("Delete this debt?")) {
                    deleteDebt.mutate({ id: debt.id, userId });
                  }
                }}
                className="text-red-500 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLoans = () => (
    <div className="space-y-6">
      {/* Add Loan Form */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Loans (Money Lent Out)</h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Borrower name"
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={newLoanBorrower}
            onChange={(e) => setNewLoanBorrower(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount remaining"
            className="w-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={newLoanAmountRemaining}
            onChange={(e) => setNewLoanAmountRemaining(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Monthly collection"
            className="w-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={newLoanMonthlyCollect}
            onChange={(e) => setNewLoanMonthlyCollect(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const btn = document.getElementById("add-loan-btn");
                btn?.click();
              }
            }}
          />
          <button
            id="add-loan-btn"
            onClick={() => {
              if (!requireAuth()) return;
              if (
                !newLoanBorrower ||
                !newLoanAmountRemaining ||
                !newLoanMonthlyCollect
              ) {
                alert("Vui lòng nhập đủ thông tin cho khoản cho vay.");
                return;
              }
              const amt = parseFloat(newLoanAmountRemaining);
              const mon = parseFloat(newLoanMonthlyCollect);
              if (isNaN(amt) || amt < 0 || isNaN(mon) || mon < 0) {
                alert("Vui lòng nhập số tiền hợp lệ (>= 0).");
                return;
              }
              createLoan.mutate({
                userId: userId,
                payload: {
                  borrower: newLoanBorrower,
                  amountRemaining: amt,
                  monthlyCollect: mon,
                },
              });
              setNewLoanBorrower("");
              setNewLoanAmountRemaining("");
              setNewLoanMonthlyCollect("");
            }}
            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600"
          >
            + Add Loan
          </button>
        </div>
      </div>

      {/* Horizontal card list */}
      <div className="space-y-3">
        {loans.map((loan: Loan) => (
          <div
            key={loan.id}
            className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
          >
            <div>
              <h4 className="font-semibold">{loan.borrower}</h4>
              <p className="text-lg font-bold text-green-600">
                ${loan.amountRemaining.toFixed(2)} remaining
              </p>
              <p className="text-sm text-gray-600">
                ${loan.monthlyCollect.toFixed(2)}/month
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  const newAmount = prompt(
                    "Amount remaining:",
                    loan.amountRemaining.toString()
                  );
                  if (newAmount) {
                    const amt = parseFloat(newAmount);
                    if (!isNaN(amt) && amt >= 0) {
                      updateLoan.mutate({
                        id: loan.id,
                        payload: { amountRemaining: amt },
                        userId: userId,
                      });
                    } else {
                      alert("Please enter a valid non-negative amount.");
                    }
                  }
                }}
                className="text-blue-500 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  if (confirm("Delete this loan?")) {
                    deleteLoan.mutate({ id: loan.id, userId });
                  }
                }}
                className="text-red-500 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSavingPlans = () => (
    <div className="space-y-6">
      {/* Add Saving Plan Form */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Saving Plans</h3>
        <div className="flex items-center gap-3">
          <select
            className="p-3 border rounded-lg"
            value={newPlanType}
            onChange={(e) => setNewPlanType(e.target.value as SavingPlanType)}
          >
            <option value="saving">Saving</option>
            <option value="send_home">Send Home</option>
            <option value="investing">Investing</option>
          </select>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={usePlanPercentage}
                onChange={() => setUsePlanPercentage(true)}
              />
              Percentage of salary
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={!usePlanPercentage}
                onChange={() => setUsePlanPercentage(false)}
              />
              Fixed amount
            </label>
          </div>
          {usePlanPercentage ? (
            <input
              type="number"
              step="0.01"
              placeholder="Percentage (0-100)"
              className="w-48 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newPlanPercentage}
              onChange={(e) => setNewPlanPercentage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const btn = document.getElementById("add-savingplan-btn");
                  btn?.click();
                }
              }}
            />
          ) : (
            <input
              type="number"
              step="0.01"
              placeholder="Fixed amount"
              className="w-48 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newPlanFixedAmount}
              onChange={(e) => setNewPlanFixedAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const btn = document.getElementById("add-savingplan-btn");
                  btn?.click();
                }
              }}
            />
          )}
          <button
            id="add-savingplan-btn"
            onClick={() => {
              if (!requireAuth()) return;
              if (usePlanPercentage) {
                if (!newPlanPercentage) {
                  alert("Vui lòng nhập phần trăm lương.");
                  return;
                }
                const perc = parseFloat(newPlanPercentage);
                if (isNaN(perc) || perc < 0 || perc > 100) {
                  alert("Vui lòng nhập phần trăm hợp lệ (0-100).");
                  return;
                }
                createSavingPlan.mutate({
                  userId: userId,
                  payload: {
                    type: newPlanType,
                    percentageOfSalary: perc,
                  },
                });
                setNewPlanPercentage("");
              } else {
                if (!newPlanFixedAmount) {
                  alert("Vui lòng nhập số tiền cố định.");
                  return;
                }
                const amt = parseFloat(newPlanFixedAmount);
                if (isNaN(amt) || amt < 0) {
                  alert("Vui lòng nhập số tiền hợp lệ (>= 0).");
                  return;
                }
                createSavingPlan.mutate({
                  userId: userId,
                  payload: {
                    type: newPlanType,
                    fixedAmount: amt,
                  },
                });
                setNewPlanFixedAmount("");
              }
            }}
            className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600"
          >
            + Add Saving Plan
          </button>
        </div>
      </div>

      {/* Horizontal card list */}
      <div className="space-y-3">
        {savingPlans.map((plan: SavingPlan) => (
          <div
            key={plan.id}
            className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
          >
            <div>
              <h4 className="font-semibold capitalize">
                {plan.type} Saving Plan
              </h4>
              {plan.percentageOfSalary ? (
                <p className="text-lg font-bold text-purple-600">
                  {plan.percentageOfSalary}% of salary
                </p>
              ) : (
                <p className="text-lg font-bold text-purple-600">
                  ${plan.fixedAmount?.toFixed(2)}/month
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  if (
                    plan.percentageOfSalary !== undefined &&
                    plan.percentageOfSalary !== null
                  ) {
                    const newPercentage = prompt(
                      "New percentage:",
                      plan.percentageOfSalary?.toString()
                    );
                    if (newPercentage) {
                      const perc = parseFloat(newPercentage);
                      if (!isNaN(perc) && perc >= 0 && perc <= 100) {
                        updateSavingPlan.mutate({
                          id: plan.id,
                          payload: { percentageOfSalary: perc },
                          userId: userId,
                        });
                      } else {
                        alert(
                          "Please enter a valid percentage between 0 and 100."
                        );
                      }
                    }
                  } else {
                    const newAmount = prompt(
                      "New amount:",
                      plan.fixedAmount?.toString()
                    );
                    if (newAmount) {
                      const amt = parseFloat(newAmount);
                      if (!isNaN(amt) && amt >= 0) {
                        updateSavingPlan.mutate({
                          id: plan.id,
                          payload: { fixedAmount: amt },
                          userId: userId,
                        });
                      } else {
                        alert("Please enter a valid non-negative amount.");
                      }
                    }
                  }
                }}
                className="text-blue-500 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  if (confirm("Delete this saving plan?")) {
                    deleteSavingPlan.mutate({ id: plan.id, userId: userId });
                  }
                }}
                className="text-red-500 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDailySpending = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daily Spending Log</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 border rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Log Spending for {selectedDate}</h4>
        <div className="flex space-x-4">
          <input
            type="number"
            placeholder="Amount spent"
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                if (!requireAuth()) return;
                const amount = parseFloat((e.target as HTMLInputElement).value);
                if (amount >= 0) {
                  upsertDailyLog.mutate({
                    userId: userId,
                    payload: {
                      date: selectedDate,
                      amountSpent: amount,
                    },
                  });
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />
          <button
            onClick={() => {
              if (!requireAuth()) return;
              const input = document.querySelector(
                'input[placeholder="Amount spent"]'
              ) as HTMLInputElement;
              const amount = parseFloat(input.value);
              if (amount >= 0) {
                upsertDailyLog.mutate({
                  userId: userId,
                  payload: {
                    date: selectedDate,
                    amountSpent: amount,
                  },
                });
                input.value = "";
              }
            }}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600"
          >
            Log Spending
          </button>
        </div>

        {dailyLogs.length > 0 && (
          <div className="mt-4">
            <h5 className="font-medium mb-2">Today&apos;s Spending:</h5>
            {dailyLogs.map((log: DailySpendingLog) => (
              <div
                key={log.id}
                className="flex justify-between items-center py-2 border-b"
              >
                <span>{log.date}</span>
                <span className="font-bold">${log.amountSpent.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Calendar View */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Monthly View</h4>
        {(() => {
          const baseDate = new Date(selectedDate);
          const year = baseDate.getFullYear();
          const month = baseDate.getMonth();
          const firstDay = new Date(year, month, 1);
          const lastDay = new Date(year, month + 1, 0);
          const daysInMonth = lastDay.getDate();
          const startWeekday = firstDay.getDay();

          const cells: Array<{
            dateStr: string | null;
            amount: number | null;
          }> = [];
          for (let i = 0; i < startWeekday; i++)
            cells.push({ dateStr: null, amount: null });
          for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const dateStr = dateObj.toISOString().split("T")[0];
            const log = allDailyLogs.find(
              (l: DailySpendingLog) => l.date === dateStr
            );
            cells.push({ dateStr, amount: log ? log.amountSpent : 0 });
          }
          const budget = summary?.dailyAllowance ?? 0;

          const today = new Date();
          const isPast = (dateStr: string) => {
            const d = new Date(dateStr);
            return (
              d <
              new Date(today.getFullYear(), today.getMonth(), today.getDate())
            );
          };
          const isFuture = (dateStr: string) => {
            const d = new Date(dateStr);
            return (
              d >
              new Date(today.getFullYear(), today.getMonth(), today.getDate())
            );
          };

          return (
            <div className="grid grid-cols-7 gap-2">
              {cells.map((cell, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-2 min-h-[70px] flex flex-col"
                >
                  {cell.dateStr ? (
                    <>
                      <div className="text-xs text-gray-600">
                        {new Date(cell.dateStr).toLocaleDateString(undefined, {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </div>
                      <div
                        className={
                          cell.amount !== null && cell.amount > budget
                            ? "mt-1 text-sm font-semibold text-red-600"
                            : "mt-1 text-sm font-semibold text-green-600"
                        }
                      >
                        ${cell.amount?.toFixed(2)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Recommend: ${budget.toFixed(2)}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          disabled={
                            isPast(cell.dateStr) ||
                            dailyLogs.some(
                              (l: DailySpendingLog) => l.date === cell.dateStr
                            )
                          }
                          onClick={() => {
                            if (!requireAuth()) return;
                            if (isFuture(cell.dateStr!)) {
                              alert(
                                "Ngày này chưa tới, chưa thể nhập chi tiêu."
                              );
                              return;
                            }
                            const amtStr = prompt("Enter amount spent:");
                            if (!amtStr) return;
                            const amt = parseFloat(amtStr);
                            if (isNaN(amt) || amt < 0) {
                              alert(
                                "Please enter a valid non-negative amount."
                              );
                              return;
                            }
                            upsertDailyLog.mutate({
                              userId,
                              payload: {
                                date: cell.dateStr!,
                                amountSpent: amt,
                              },
                            });
                          }}
                          className="text-xs px-2 py-1 rounded bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Log Spend
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-300">&nbsp;</div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            summary={summary ?? undefined}
            debts={debts}
            loans={loans}
            savingPlans={savingPlans}
            salaryInput={salaryInput}
            setSalaryInput={setSalaryInput}
            submitSalary={submitSalary}
            paydayInput={paydayInput}
            setPaydayInput={setPaydayInput}
            submitPayday={submitPayday}
            handleRecalculateAllowance={handleRecalculateAllowance}
          />
        );
      case "expenses":
        return (
          <FixedExpensesTab
            fixedExpenses={fixedExpenses}
            newExpenseName={newExpenseName}
            setNewExpenseName={setNewExpenseName}
            newExpenseAmount={newExpenseAmount}
            setNewExpenseAmount={setNewExpenseAmount}
            requireAuth={requireAuth}
            createFixedExpense={createFixedExpense}
            updateFixedExpense={updateFixedExpense}
            deleteFixedExpense={deleteFixedExpense}
            userId={userId}
          />
        );
      case "debts":
        return (
          <DebtsTab
            debts={debts}
            newDebtCreditor={newDebtCreditor}
            setNewDebtCreditor={setNewDebtCreditor}
            newDebtAmountRemaining={newDebtAmountRemaining}
            setNewDebtAmountRemaining={setNewDebtAmountRemaining}
            newDebtMonthlyPayment={newDebtMonthlyPayment}
            setNewDebtMonthlyPayment={setNewDebtMonthlyPayment}
            requireAuth={requireAuth}
            createDebt={createDebt}
            updateDebt={updateDebt}
            deleteDebt={deleteDebt}
            userId={userId}
          />
        );
      case "loans":
        return (
          <LoansTab
            loans={loans}
            newLoanBorrower={newLoanBorrower}
            setNewLoanBorrower={setNewLoanBorrower}
            newLoanAmountRemaining={newLoanAmountRemaining}
            setNewLoanAmountRemaining={setNewLoanAmountRemaining}
            newLoanMonthlyCollect={newLoanMonthlyCollect}
            setNewLoanMonthlyCollect={setNewLoanMonthlyCollect}
            requireAuth={requireAuth}
            createLoan={createLoan}
            updateLoan={updateLoan}
            deleteLoan={deleteLoan}
            userId={userId}
          />
        );
      case "savings":
        return (
          <SavingPlansTab
            savingPlans={savingPlans}
            newPlanType={newPlanType}
            setNewPlanType={setNewPlanType}
            usePlanPercentage={usePlanPercentage}
            setUsePlanPercentage={setUsePlanPercentage}
            newPlanPercentage={newPlanPercentage}
            setNewPlanPercentage={setNewPlanPercentage}
            newPlanFixedAmount={newPlanFixedAmount}
            setNewPlanFixedAmount={setNewPlanFixedAmount}
            requireAuth={requireAuth}
            createSavingPlan={createSavingPlan}
            updateSavingPlan={updateSavingPlan}
            deleteSavingPlan={deleteSavingPlan}
            userId={userId}
          />
        );
      case "daily":
        return (
          <DailySpendingTab
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dailyLogs={dailyLogs}
            allDailyLogs={allDailyLogs}
            upsertDailyLog={upsertDailyLog}
            summary={summary ?? undefined}
            requireAuth={requireAuth}
            userId={userId}
          />
        );
      default:
        return (
          <OverviewTab
            summary={summary ?? undefined}
            debts={debts}
            loans={loans}
            savingPlans={savingPlans}
            salaryInput={salaryInput}
            setSalaryInput={setSalaryInput}
            submitSalary={submitSalary}
            paydayInput={paydayInput}
            setPaydayInput={setPaydayInput}
            submitPayday={submitPayday}
            handleRecalculateAllowance={handleRecalculateAllowance}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saving Planner</h1>
          <p className="text-gray-600 mt-2">
            Manage your finances and track your saving goals
          </p>
          {/* Redux User Selector */}
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm text-gray-700">Current User</label>
            <select
              value={hasValidUser ? userId : ""}
              onChange={(e) => setUserId(e.target.value)}
              className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>
                Select a user
              </option>
              {reduxUsers?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            {!hasValidUser && (
              <span className="text-xs text-red-600">
                No user selected. Please choose one to proceed.
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
