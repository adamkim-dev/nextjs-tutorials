"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Utility } from "@/app/utils";
import { DailySpendingLog, SavingPlannerSummary } from "../../models";

type Props = {
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  dailyLogs: DailySpendingLog[];
  allDailyLogs: DailySpendingLog[];
  upsertDailyLog: any;
  summary?: SavingPlannerSummary;
  requireAuth: () => boolean;
  userId: string;
  customDailyBudget?: number;
};

export default function DailySpendingTab({
  selectedDate,
  setSelectedDate,
  dailyLogs,
  allDailyLogs,
  upsertDailyLog,
  summary,
  requireAuth,
  userId,
  customDailyBudget,
}: Props) {
  const isPast = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isFuture = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d > today;
  };

  return (
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
            id="daily-spend-input"
          />
          <button
            onClick={() => {
              if (!requireAuth()) return;
              const input = document.getElementById(
                "daily-spend-input"
              ) as HTMLInputElement | null;
              const amtStr = input?.value || "";
              if (!amtStr) return;
              const amt = parseFloat(amtStr);
              if (isNaN(amt) || amt < 0) {
                alert("Please enter a valid non-negative amount.");
                return;
              }
              upsertDailyLog.mutate({
                userId,
                payload: { date: selectedDate, amountSpent: amt },
              });
              if (input) input.value = "";
            }}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600"
          >
            Log Spend
          </button>
        </div>
        {dailyLogs.length > 0 && (
          <div className="mt-6">
            <h5 className="font-medium mb-2">Today&apos;s Spending:</h5>
            {dailyLogs.map((log: DailySpendingLog) => (
              <div
                key={log.id}
                className="flex justify-between items-center py-2 border-b"
              >
                <span>{log.date}</span>
                <span className="font-bold">
                  ${Utility.formatMoney(log.amountSpent)}
                </span>
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
          const budget =
            typeof customDailyBudget === "number" && customDailyBudget >= 0
              ? customDailyBudget
              : summary?.dailyAllowance ?? 0;

          return (
            <div className="grid grid-cols-7 gap-2">
              {cells.map((cell, idx) => (
                <div
                  key={idx}
                  className="border rounded p-2 h-24 flex flex-col justify-between"
                >
                  {cell.dateStr ? (
                    <div className="text-xs text-gray-600">
                      {new Date(cell.dateStr).getDate()}/
                      {new Date(cell.dateStr).getMonth() + 1}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-300">&nbsp;</div>
                  )}
                  {cell.dateStr && (
                    <div className="text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Budget:</span>
                        <span className="font-semibold">
                          ${Utility.formatMoney(budget)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-500">Spent:</span>
                        <span className="font-semibold">
                          ${Utility.formatMoney(cell.amount || 0)}
                        </span>
                      </div>
                    </div>
                  )}
                  {cell.dateStr && (
                    <button
                      disabled={
                        isPast(cell.dateStr) ||
                        allDailyLogs.some(
                          (l: DailySpendingLog) => l.date === cell.dateStr
                        )
                      }
                      onClick={() => {
                        if (!requireAuth()) return;
                        if (isFuture(cell.dateStr!)) {
                          alert("Ngày này chưa tới, chưa thể nhập chi tiêu.");
                          return;
                        }
                        const amtStr = prompt("Enter amount spent:");
                        if (!amtStr) return;
                        const amt = parseFloat(amtStr);
                        if (isNaN(amt) || amt < 0) {
                          alert("Please enter a valid non-negative amount.");
                          return;
                        }
                        upsertDailyLog.mutate({
                          userId,
                          payload: { date: cell.dateStr!, amountSpent: amt },
                        });
                      }}
                      className="text-xs px-2 py-1 rounded bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Log Spend
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
