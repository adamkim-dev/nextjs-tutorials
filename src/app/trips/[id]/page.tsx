"use client";

import useTrips from "@/app/hooks/useTrips";
import useUsers from "@/app/hooks/useUsers";
import { TripActivity } from "@/app/models";
import { Utility } from "@/app/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";

export default function TripDetail() {
  const { id } = useParams();
  const { tripDetail } = useTrips({ tripId: id as string });
  const router = useRouter();
  const { participants, activities, payers } = tripDetail || {};

  console.log("🚀 ~ TripDetail ~ tripDetail:", tripDetail);
  const { data: users, getUserById } = useUsers();
  console.log("🚀 ~ TripDetail ~ users:", users);

  const changeStatus = async () => {};

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const getUserDetailById = useCallback(
    (userId: string) => {
      return users.find((user) => user.id === userId);
    },
    [users]
  );

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-gray-50 text-foreground">
      <header className="py-4 text-center text-xl font-bold flex items-center justify-between bg-white rounded-lg shadow p-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:text-blue-700 transition"
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <span className="text-2xl">{tripDetail?.name}</span>
        <div className="w-8"></div> {/* Spacer for balance */}
      </header>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* {tripDetail?.status === "on-going" &&
            participantsNeedToPay.length > 0 && (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-3 transition shadow-sm flex items-center justify-center"
                onClick={() => {
                  setShowPaymentForm(!showPaymentForm);
                  setShowRefundForm(false);
                }}
              >
                <span className="mr-2">{showPaymentForm ? "❌" : "💰"}</span>
                {showPaymentForm ? "Cancel Payment" : "Collect Payment"}
              </button>
            )} */}

          {/* {tripDetail?.status === "on-going" &&
            participantsNeedRefund.length > 0 && (
              <button
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-3 transition shadow-sm flex items-center justify-center"
                onClick={() => {
                  setShowRefundForm(!showRefundForm);
                  setShowPaymentForm(false);
                }}
              >
                <span className="mr-2">{showRefundForm ? "❌" : "💸"}</span>
                {showRefundForm ? "Cancel Refund" : "Process Refund"}
              </button>
            )} */}
          {tripDetail?.status !== "planed" && (
            <Link
              href={`/trips/${id}/payment-history`}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-3 transition shadow-sm flex items-center justify-center"
            >
              <span className="mr-2">📜</span>
              View Payment History
            </Link>
          )}

          {tripDetail?.status === "on-going" && (
            <Link
              href={`/trips/${id}/create-activity`}
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-3 transition shadow-sm flex items-center justify-center"
            >
              <span className="mr-2">➕</span>
              Create New Activity
            </Link>
          )}

          <Link
            href={`/trips/${id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg p-3 transition shadow-sm flex items-center justify-center"
          >
            <span className="mr-2">✏️</span>
            Edit Trip
          </Link>

          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg p-3 transition shadow-sm flex items-center justify-center"
            onClick={changeStatus}
          >
            <span className="mr-2">🔄</span>
            Change Status ({tripDetail?.status})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Trip Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="text-sm text-gray-500">Date</div>
            <div className="font-medium">
              {tripDetail?.date
                ? new Date(tripDetail?.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Not specified"}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="text-sm text-gray-500">Status</div>
            <div className="font-medium capitalize">{tripDetail?.status}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="text-sm text-gray-500">Total</div>
            <div className="font-medium">${Utility.formatMoney(tripDetail?.totalMoney ?? 0)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="text-sm text-gray-500">Total Collected</div>
            <div className="font-medium text-green-600">
              {/* ${totalCollectedMoney} */}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="text-sm text-gray-500">Total Debt</div>
            <div className="font-medium text-red-600">
              {/* ${totalDebtMoney.toFixed(2)} */}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="text-sm text-gray-500">Average Expense</div>
            <div className="font-medium">
              ${Utility.formatMoney(tripDetail?.moneyPerUser ?? 0)}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Payers</h3>
          <div className="flex flex-wrap gap-3">
            {payers?.length ? (
              payers?.map((payer, idx) => (
                <div
                  key={idx}
                  className="flex items-center bg-blue-50 rounded-full px-4 py-2 shadow-sm hover:shadow transition"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-2">
                    {getUserDetailById(payer.userId)?.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {getUserDetailById(payer.userId)?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Utility.formatMoney(payer.spentMoney)}$
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No payers yet</div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">
            Participants
          </h3>
          <div className="flex flex-wrap gap-3">
            {participants?.map((participant, idx) => (
              <div
                key={idx}
                className="flex items-center bg-gray-50 rounded-full px-4 py-2 shadow-sm hover:shadow transition"
              >
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold mr-2">
                  {getUserById(participant.userId)?.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">
                    {getUserById(participant.userId)?.name}
                  </div>
                  <div className="text-sm">
                    {/* <span
                      className={
                        participant.remainingToPay > 0
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    >
                      {participant.totalMoneyPerUser.toFixed(2)}$
                    </span>
                    <br />
                    {participant.remainingToPay > 0 && (
                      <span className="text-red-500">
                        need to pay: ${participant.remainingToPay.toFixed(2)}
                      </span>
                    )}
                    {participant.remainingToPay < 0 && (
                      <span className="text-green-500">
                        need to refunded:
                        {Math.abs(participant.remainingToPay).toFixed(2)} $
                      </span>
                    )} */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">Activities</h3>
        <ul className="divide-y">
          {activities?.length ? (
            activities?.map((activity: TripActivity) => {
              const payer = users.find((u) => u.id === activity.payerId);
              return (
                <li key={activity.id} className="py-2">
                  <Link
                    href={`/activity/${activity.id}`}
                    className="block hover:bg-gray-50 rounded p-3 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-bold">{activity.name}</span>
                        <span className="text-gray-600">
                          payer:{" "}
                          <span className="font-semibold">
                            {payer?.name || "Unknown"}
                          </span>
                        </span>
                      </div>
                      <div className="font-semibold">
                        ${Utility.formatMoney(activity.totalMoney)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {Utility.formatDate(activity.updatedAt)}
                    </div>
                  </Link>
                </li>
              );
            })
          ) : (
            <div className="text-gray-500">No activities yet</div>
          )}
        </ul>
      </div>

      {/* {showPaymentForm && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Collect Payment</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payer</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition"
                >
                  <option value="">Select payer</option>
                  {participantsNeedToPay.map((participant) => (
                    <option key={participant.userId} value={participant.userId}>
                      {participant.name} - Remaining: $
                      {participant.remainingToPay}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Date
                </label>
                <input
                  type="datetime-local"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Note</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded p-3 transition shadow-sm flex items-center justify-center"
            >
              <span className="mr-2">✅</span>
              Confirm Payment
            </button>
          </form>
        </div>
      )}

      {showRefundForm && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <form onSubmit={handleRefundSubmit} className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Process Refund</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Recipient
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition"
                >
                  <option value="">Select recipient</option>
                  {participantsNeedRefund.map((participant) => (
                    <option key={participant.userId} value={participant.userId}>
                      {participant.name} - To be refunded: $
                      {Math.abs(participant.remainingToPay)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Refund Date
                </label>
                <input
                  type="datetime-local"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Note</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded p-3 transition shadow-sm flex items-center justify-center"
            >
              <span className="mr-2">✅</span>
              Confirm Refund
            </button>
          </form>
        </div>
      )}

      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Warning</h3>
            <p className="mb-6">
              The accounting is not complete yet! Some members still need to pay
              or be refunded.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition"
                onClick={() => setShowWarning(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
                onClick={async () => {
                  setShowWarning(false);
                  // Force update status
                  const statusOrder: TripStatus[] = [
                    "planed",
                    "on-going",
                    "ended",
                  ];
                  const currentIndex = statusOrder.indexOf(trip.status);
                  const nextIndex = (currentIndex + 1) % statusOrder.length;
                  const newStatus = statusOrder[nextIndex];

                  // Update trip status via API
                  try {
                    const response = await fetch(`/api/trips/${id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ...trip, status: newStatus }),
                    });

                    if (response.ok) {
                      const updatedTrip = await response.json();
                      setTrip(updatedTrip);
                    }
                  } catch (error) {
                    console.error("Error updating trip status:", error);
                  }
                }}
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
