"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import useUsers from "@/app/hooks/useUsers";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { useEffect } from "react";
import { SavingPlannerSummary } from "@/app/models";
import {
  setSelectedUserId,
  setSalary,
  setPayday,
  addFixedExpense,
  removeFixedExpense,
  addDebt,
  removeDebt,
  addLoan,
  removeLoan,
  setStep,
} from "@/app/redux/slices/savingPlannerSetupSlice";
import { Utility } from "@/app/utils";

function daysUntilNextPayday(payday: number | null): number {
  if (!payday) return 0;
  const today = new Date();
  const next = new Date(today.getFullYear(), today.getMonth(), payday);
  next.setHours(0, 0, 0, 0);
  const todayMid = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  todayMid.setHours(0, 0, 0, 0);
  if (todayMid > next) {
    next.setMonth(next.getMonth() + 1);
  }
  const ms = next.getTime() - todayMid.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}

type Props = {
  onApplySetup?: (setup: any) => void;
  onUserSelect?: (userId: string | null) => void;
  currentUserId?: string | null;
  currentSummary?: SavingPlannerSummary;
};

export default function SetupWizard({
  onApplySetup,
  onUserSelect,
  currentUserId,
  currentSummary,
}: Props) {
  const dispatch = useAppDispatch();
  const { data: users } = useUsers();
  const setup = useAppSelector((s) => s.savingPlannerSetup);

  // Đồng bộ selectedUserId của wizard với user đã chọn ở header
  useEffect(() => {
    if (currentUserId && currentUserId !== setup.selectedUserId) {
      dispatch(setSelectedUserId(currentUserId));
    }
  }, [currentUserId]);

  // Prefill salary/payday từ dữ liệu user đã lưu trong DB (nếu wizard chưa có)
  useEffect(() => {
    if (!currentUserId) return;
    const u = users?.find((x) => x.id === currentUserId);
    if (!u) return;
    if (setup.salary == null && typeof (u as any).salary === "number") {
      dispatch(setSalary((u as any).salary));
    }
    if (setup.payday == null && typeof (u as any).payday === "number") {
      dispatch(setPayday((u as any).payday));
    }
  }, [currentUserId, users]);

  const totalFixed = setup.fixedExpenses.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );
  const totalDebt = setup.debts.reduce(
    (sum, d) => sum + (d.monthlyPayment || 0),
    0
  );
  const totalLoanIncome = setup.loans.reduce(
    (sum, l) => sum + (l.monthlyCollect || 0),
    0
  );
  const cycleDays = daysUntilNextPayday(setup.payday);
  const dailySuggestionLocal =
    setup.salary && cycleDays
      ? Math.max(
          0,
          (setup.salary - totalFixed - totalDebt + totalLoanIncome) / cycleDays
        )
      : 0;
  const displayDailySuggestion =
    currentSummary && typeof currentSummary.dailyAllowance === "number"
      ? currentSummary.dailyAllowance
      : dailySuggestionLocal;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Smart Saving Setup (Q/A)</h2>
        <div className="text-sm text-gray-600">Step {setup.step} of 3</div>
      </div>

      {/* Stepper Controls */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => dispatch(setStep(s))}
            className={`px-3 py-1 rounded ${
              setup.step === s
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {setup.step === 1 && (
        <div className="space-y-4">
          <div>
            {!currentUserId ? (
              <>
                <label className="block text-sm font-medium mb-1">
                  Choose User
                </label>
                <select
                  value={setup.selectedUserId || ""}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    dispatch(setSelectedUserId(val));
                    onUserSelect?.(val);
                  }}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select a user</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email || u.id}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <div className="p-3 border rounded-lg bg-gray-50 text-sm text-gray-700">
                Using current user:{" "}
                {users?.find((u) => u.id === currentUserId)?.name ||
                  users?.find((u) => u.id === currentUserId)?.email ||
                  currentUserId}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              placeholder="Enter salary per month"
              className="flex-1 p-3 border rounded-lg"
              value={setup.salary ?? ""}
              onChange={(e) =>
                dispatch(
                  setSalary(e.target.value ? parseFloat(e.target.value) : null)
                )
              }
            />
            <input
              type="number"
              placeholder="Enter pay day (1-31)"
              className="w-60 p-3 border rounded-lg"
              value={setup.payday ?? ""}
              onChange={(e) =>
                dispatch(
                  setPayday(e.target.value ? parseInt(e.target.value) : null)
                )
              }
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => dispatch(setStep(2))}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {setup.step === 2 && (
        <div className="space-y-6">
          {/* Fixed Expenses */}
          <div>
            <h3 className="font-semibold mb-2">Fixed Expenses</h3>
            <div className="flex items-center gap-2">
              <input
                id="fx-name"
                className="flex-1 p-2 border rounded"
                placeholder="Name"
              />
              <input
                id="fx-amt"
                type="number"
                className="w-40 p-2 border rounded"
                placeholder="Amount"
              />
              <button
                onClick={() => {
                  const name =
                    (document.getElementById("fx-name") as HTMLInputElement)
                      ?.value || "";
                  const amtStr =
                    (document.getElementById("fx-amt") as HTMLInputElement)
                      ?.value || "";
                  const amt = parseFloat(amtStr);
                  if (!name || isNaN(amt) || amt < 0) return;
                  dispatch(addFixedExpense({ name, amount: amt }));
                  (
                    document.getElementById("fx-name") as HTMLInputElement
                  ).value = "";
                  (
                    document.getElementById("fx-amt") as HTMLInputElement
                  ).value = "";
                }}
                className="bg-blue-500 text-white px-3 py-2 rounded"
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {setup.fixedExpenses.map((e, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>
                    {e.name} - ${Utility.formatMoney(e.amount)}
                  </span>
                  <button
                    onClick={() => dispatch(removeFixedExpense(idx))}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Debts */}
          <div>
            <h3 className="font-semibold mb-2">Debts</h3>
            <div className="flex items-center gap-2">
              <input
                id="db-cred"
                className="flex-1 p-2 border rounded"
                placeholder="Creditor"
              />
              <input
                id="db-rem"
                type="number"
                className="w-40 p-2 border rounded"
                placeholder="Amount remaining"
              />
              <input
                id="db-mon"
                type="number"
                className="w-40 p-2 border rounded"
                placeholder="Monthly payment"
              />
              <button
                onClick={() => {
                  const cred =
                    (document.getElementById("db-cred") as HTMLInputElement)
                      ?.value || "";
                  const remStr =
                    (document.getElementById("db-rem") as HTMLInputElement)
                      ?.value || "";
                  const monStr =
                    (document.getElementById("db-mon") as HTMLInputElement)
                      ?.value || "";
                  const rem = parseFloat(remStr);
                  const mon = parseFloat(monStr);
                  if (!cred || isNaN(rem) || rem < 0 || isNaN(mon) || mon < 0)
                    return;
                  dispatch(
                    addDebt({
                      creditor: cred,
                      amountRemaining: rem,
                      monthlyPayment: mon,
                    })
                  );
                  (
                    document.getElementById("db-cred") as HTMLInputElement
                  ).value = "";
                  (
                    document.getElementById("db-rem") as HTMLInputElement
                  ).value = "";
                  (
                    document.getElementById("db-mon") as HTMLInputElement
                  ).value = "";
                }}
                className="bg-blue-500 text-white px-3 py-2 rounded"
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {setup.debts.map((d, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>
                    {d.creditor} - ${Utility.formatMoney(d.monthlyPayment)}
                    /month
                  </span>
                  <button
                    onClick={() => dispatch(removeDebt(idx))}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Loans */}
          <div>
            <h3 className="font-semibold mb-2">Loans</h3>
            <div className="flex items-center gap-2">
              <input
                id="ln-borr"
                className="flex-1 p-2 border rounded"
                placeholder="Borrower"
              />
              <input
                id="ln-rem"
                type="number"
                className="w-40 p-2 border rounded"
                placeholder="Amount remaining"
              />
              <input
                id="ln-mon"
                type="number"
                className="w-40 p-2 border rounded"
                placeholder="Monthly collect"
              />
              <button
                onClick={() => {
                  const borr =
                    (document.getElementById("ln-borr") as HTMLInputElement)
                      ?.value || "";
                  const remStr =
                    (document.getElementById("ln-rem") as HTMLInputElement)
                      ?.value || "";
                  const monStr =
                    (document.getElementById("ln-mon") as HTMLInputElement)
                      ?.value || "";
                  const rem = parseFloat(remStr);
                  const mon = parseFloat(monStr);
                  if (!borr || isNaN(rem) || rem < 0 || isNaN(mon) || mon < 0)
                    return;
                  dispatch(
                    addLoan({
                      borrower: borr,
                      amountRemaining: rem,
                      monthlyCollect: mon,
                    })
                  );
                  (
                    document.getElementById("ln-borr") as HTMLInputElement
                  ).value = "";
                  (
                    document.getElementById("ln-rem") as HTMLInputElement
                  ).value = "";
                  (
                    document.getElementById("ln-mon") as HTMLInputElement
                  ).value = "";
                }}
                className="bg-blue-500 text-white px-3 py-2 rounded"
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {setup.loans.map((l, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>
                    {l.borrower} - +${Utility.formatMoney(l.monthlyCollect)}
                    /month
                  </span>
                  <button
                    onClick={() => dispatch(removeLoan(idx))}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => dispatch(setStep(1))}
              className="px-4 py-2 rounded border"
            >
              Back
            </button>
            <button
              onClick={() => dispatch(setStep(3))}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {setup.step === 3 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Daily Spending Suggestion</h3>
          <p className="text-gray-700">
            Based on your inputs, suggested daily budget until next payday:
          </p>
          <div className="text-2xl font-bold text-green-700">
            ${Utility.formatMoney(displayDailySuggestion)}
          </div>
          <div className="text-sm text-gray-600">
            Cycle days remaining: {cycleDays}
          </div>

          {/* Simple calendar showing only days until next payday */}
          {(() => {
            const today = new Date();
            const days = cycleDays;
            const cells = Array.from({ length: days }, (_, i) => {
              const d = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + i
              );
              const dateStr = d.toISOString().split("T")[0];
              return { dateStr, day: d.getDate(), month: d.getMonth() + 1 };
            });

            return (
              <div className="grid grid-cols-7 gap-2">
                {cells.map((c, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-2 h-20 flex flex-col justify-between bg-green-50"
                  >
                    <div className="text-xs text-gray-600">
                      {c.day}/{c.month}
                    </div>
                    <div className="text-xs flex items-center justify-between">
                      <span className="text-gray-500">Budget:</span>
                      <span className="font-semibold">
                        ${Utility.formatMoney(displayDailySuggestion)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="flex justify-between mt-4">
            <button
              onClick={() => dispatch(setStep(2))}
              className="px-4 py-2 rounded border"
            >
              Back
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(setStep(1))}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Start Over
              </button>
              <button
                onClick={() => onApplySetup?.(setup)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
