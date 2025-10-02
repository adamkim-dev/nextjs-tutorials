/* eslint-disable @typescript-eslint/no-explicit-any */

import { Debt } from "../../models";

type Props = {
  debts: Debt[];
  newDebtCreditor: string;
  setNewDebtCreditor: (v: string) => void;
  newDebtAmountRemaining: string;
  setNewDebtAmountRemaining: (v: string) => void;
  newDebtMonthlyPayment: string;
  setNewDebtMonthlyPayment: (v: string) => void;
  requireAuth: () => boolean;
  createDebt: any;
  updateDebt: any;
  deleteDebt: any;
  userId: string;
};

export default function DebtsTab({
  debts,
  newDebtCreditor,
  setNewDebtCreditor,
  newDebtAmountRemaining,
  setNewDebtAmountRemaining,
  newDebtMonthlyPayment,
  setNewDebtMonthlyPayment,
  requireAuth,
  createDebt,
  updateDebt,
  deleteDebt,
  userId,
}: Props) {
  return (
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
}
