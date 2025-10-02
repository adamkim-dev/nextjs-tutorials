/* eslint-disable @typescript-eslint/no-explicit-any */

import { FixedExpense } from "../../models";

type Props = {
  fixedExpenses: FixedExpense[];
  newExpenseName: string;
  setNewExpenseName: (v: string) => void;
  newExpenseAmount: string;
  setNewExpenseAmount: (v: string) => void;
  requireAuth: () => boolean;
  createFixedExpense: any;
  updateFixedExpense: any;
  deleteFixedExpense: any;
  userId: string;
};

export default function FixedExpensesTab({
  fixedExpenses,
  newExpenseName,
  setNewExpenseName,
  newExpenseAmount,
  setNewExpenseAmount,
  requireAuth,
  createFixedExpense,
  updateFixedExpense,
  deleteFixedExpense,
  userId,
}: Props) {
  return (
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
}
