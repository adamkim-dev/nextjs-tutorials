/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loan } from "../../models";
import { Utility } from "../../utils";

type Props = {
  loans: Loan[];
  newLoanBorrower: string;
  setNewLoanBorrower: (v: string) => void;
  newLoanAmountRemaining: string;
  setNewLoanAmountRemaining: (v: string) => void;
  newLoanMonthlyCollect: string;
  setNewLoanMonthlyCollect: (v: string) => void;
  requireAuth: () => boolean;
  createLoan: any;
  updateLoan: any;
  deleteLoan: any;
  userId: string;
};

export default function LoansTab({
  loans,
  newLoanBorrower,
  setNewLoanBorrower,
  newLoanAmountRemaining,
  setNewLoanAmountRemaining,
  newLoanMonthlyCollect,
  setNewLoanMonthlyCollect,
  requireAuth,
  createLoan,
  updateLoan,
  deleteLoan,
  userId,
}: Props) {
  return (
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
            placeholder="Monthly collect"
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
                alert(
                  "Vui lòng nhập đủ thông tin khoản cho vay (tên, số tiền, thu hàng tháng)."
                );
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
                ${Utility.formatMoney(loan.amountRemaining)} remaining
              </p>
              <p className="text-sm text-gray-600">
                ${Utility.formatMoney(loan.monthlyCollect)}/month
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
}
