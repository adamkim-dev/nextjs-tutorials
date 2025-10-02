"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SavingPlan, SavingPlanType } from "../../models";
import { Utility } from "../../utils";

type Props = {
  savingPlans: SavingPlan[];
  newPlanType: SavingPlanType;
  setNewPlanType: (v: SavingPlanType) => void;
  usePlanPercentage: boolean;
  setUsePlanPercentage: (v: boolean) => void;
  newPlanPercentage: string;
  setNewPlanPercentage: (v: string) => void;
  newPlanFixedAmount: string;
  setNewPlanFixedAmount: (v: string) => void;
  requireAuth: () => boolean;
  createSavingPlan: any;
  updateSavingPlan: any;
  deleteSavingPlan: any;
  userId: string;
};

export default function SavingPlansTab({
  savingPlans,
  newPlanType,
  setNewPlanType,
  usePlanPercentage,
  setUsePlanPercentage,
  newPlanPercentage,
  setNewPlanPercentage,
  newPlanFixedAmount,
  setNewPlanFixedAmount,
  requireAuth,
  createSavingPlan,
  updateSavingPlan,
  deleteSavingPlan,
  userId,
}: Props) {
  return (
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
            />
          ) : (
            <input
              type="number"
              step="0.01"
              placeholder="Fixed amount"
              className="w-48 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newPlanFixedAmount}
              onChange={(e) => setNewPlanFixedAmount(e.target.value)}
            />
          )}
          <button
            onClick={() => {
              if (!requireAuth()) return;
              if (usePlanPercentage) {
                if (!newPlanPercentage) {
                  alert("Vui lòng nhập phần trăm.");
                  return;
                }
                const pct = parseFloat(newPlanPercentage);
                if (isNaN(pct) || pct < 0 || pct > 100) {
                  alert("Vui lòng nhập phần trăm hợp lệ (0-100).");
                  return;
                }
                createSavingPlan.mutate({
                  userId: userId,
                  payload: {
                    type: newPlanType,
                    percentageOfSalary: pct,
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
                  ${Utility.formatMoney(plan.fixedAmount ?? 0)} / month
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!requireAuth()) return;
                  if (plan.percentageOfSalary) {
                    const newPct = prompt(
                      "New percentage:",
                      plan.percentageOfSalary.toString()
                    );
                    if (newPct) {
                      const pct = parseFloat(newPct);
                      if (!isNaN(pct) && pct >= 0 && pct <= 100) {
                        updateSavingPlan.mutate({
                          id: plan.id,
                          payload: { percentageOfSalary: pct },
                          userId: userId,
                        });
                      } else {
                        alert("Please enter a valid percentage (0-100).");
                      }
                    }
                  } else {
                    const newAmt = prompt(
                      "Fixed amount:",
                      (plan.fixedAmount ?? 0).toString()
                    );
                    if (newAmt) {
                      const amt = parseFloat(newAmt);
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
}
