"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, Trip, User, TripStatus } from "@/app/models";
import Link from "next/link";
import useQueryAllTrips from "@/app/hooks/queries/useQueryTrips";

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [paymentNote, setPaymentNote] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  const response = useQueryAllTrips();

  useEffect(() => {
    // Fetch trip data
    // Fetch activities data
    fetch(`/api/activities`)
      .then((res) => res.json())
      .then((allActivities) => {
        setActivities(allActivities.filter((a: Activity) => a.tripId === id));
      });

    // Fetch users data
    fetch(`/api/users`)
      .then((res) => res.json())
      .then(setUsers);
  }, [id]);

  if (!trip) return <div>Loading...</div>;

  // Calculate total money spent on the trip
  const totalTripMoney = activities.reduce(
    (sum, activity) => sum + activity.totalMoney,
    0
  );

  // Get user names for payers
  const payersWithNames =
    trip.payers?.map((payer) => {
      const user = users.find((u) => u.id === payer.userId);
      return {
        ...payer,
        name: user?.name || "Unknown",
      };
    }) || [];

  // Calculate total money per participant
  const participantsWithTotals =
    trip.participants?.map((participant) => {
      const user = users.find((u) => u.id === participant.userId);
      const activityCosts = activities
        .filter((activity) =>
          activity.participants.some((p) => p.userId === participant.userId)
        )
        .reduce((sum, activity) => {
          const participantCost =
            activity.participants.find((p) => p.userId === participant.userId)
              ?.totalMoneyPerUser || 0;
          return sum + participantCost;
        }, 0);

      // Find if this person is a payer and how much they've spent
      const payer = trip.payers?.find((p) => p.userId === participant.userId);
      const spentMoney = payer ? payer.spentMoney : 0;

      // Calculate total paid amount (including money spent and money paid)
      const totalPaid = spentMoney + (participant.paidAmount || 0);

      // Calculate remaining amount to pay or to be refunded
      const remainingToPay = activityCosts - totalPaid;

      return {
        ...participant,
        name: user?.name || "Unknown",
        totalToPay: activityCosts,
        spentMoney,
        totalPaid,
        remainingToPay,
      };
    }) || [];

  // Filter participants who need to pay (remainingToPay > 0)
  const participantsNeedToPay = participantsWithTotals.filter(
    (p) => p.remainingToPay > 0
  );

  // Filter participants who need to be refunded (remainingToPay < 0)
  const participantsNeedRefund = participantsWithTotals.filter(
    (p) => p.remainingToPay < 0
  );

  // Calculate total collected money and total debt
  const totalCollectedMoney = participantsWithTotals.reduce(
    (sum, participant) => sum + (participant.paidAmount || 0),
    0
  );

  const totalDebtMoney = participantsNeedToPay.reduce(
    (sum, participant) => sum + participant.remainingToPay,
    0
  );

  // Check if all payments are settled
  const isAllSettled = participantsWithTotals.every(
    (p) => Math.abs(p.remainingToPay) < 0.01
  );

  // Handle status change
  const changeStatus = async () => {
    const statusOrder: TripStatus[] = ["planed", "on-going", "ended"];
    const currentIndex = statusOrder.indexOf(trip.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];

    // Check if trying to close the trip without settling all payments
    if (newStatus === "ended" && !isAllSettled) {
      setShowWarning(true);
      return;
    }

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
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const participant = trip.participants.find(
        (p) => p.userId === selectedUserId
      );
      if (!participant) return;

      const payment = {
        id: Date.now().toString(),
        tripId: trip.id,
        userId: selectedUserId,
        amount: parseFloat(paymentAmount),
        paymentDate,
        note: paymentNote,
      };

      // Update payment history
      const response = await fetch(`/api/trips/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });

      if (response.ok) {
        // Refresh trip data
        const updatedTrip = await fetch(`/api/trips/${id}`).then((res) =>
          res.json()
        );
        setTrip(updatedTrip);

        // Reset form
        setShowPaymentForm(false);
        setSelectedUserId("");
        setPaymentAmount("");
        setPaymentDate(new Date().toISOString().slice(0, 16));
        setPaymentNote("");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const participant = trip.participants.find(
        (p) => p.userId === selectedUserId
      );
      if (!participant) return;

      const payment = {
        id: Date.now().toString(),
        tripId: trip.id,
        userId: selectedUserId,
        amount: -parseFloat(paymentAmount), // Negative amount for refund
        paymentDate,
        note: `Refund: ${paymentNote}`,
      };

      // Update payment history
      const response = await fetch(`/api/trips/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });

      if (response.ok) {
        // Refresh trip data
        const updatedTrip = await fetch(`/api/trips/${id}`).then((res) =>
          res.json()
        );
        setTrip(updatedTrip);

        // Reset form
        setShowRefundForm(false);
        setSelectedUserId("");
        setPaymentAmount("");
        setPaymentDate(new Date().toISOString().slice(0, 16));
        setPaymentNote("");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
    }
  };

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-gray-50 text-foreground">
      <header className="py-4 text-center text-xl font-bold flex items-center justify-between bg-white rounded-lg shadow p-4 mb-6">
        <Link href="/" className="text-blue-500 hover:text-blue-700 transition">
          <i className="fas fa-arrow-left"></i> Back
        </Link>
        <span className="text-2xl">{trip.name}</span>
        <div className="w-8"></div> {/* Spacer for balance */}
      </header>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {trip.status === "on-going" && participantsNeedToPay.length > 0 && (
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
          )}

          {trip.status === "on-going" && participantsNeedRefund.length > 0 && (
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
          )}
          {trip.status !== "planed" && (
            <Link
              href={`/trip/${id}/payment-history`}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-3 transition shadow-sm flex items-center justify-center"
            >
              <span className="mr-2">📜</span>
              View Payment History
            </Link>
          )}

          {trip.status === "on-going" && (
            <Link
              href={`/trip/${id}/create-activity`}
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-3 transition shadow-sm flex items-center justify-center"
            >
              <span className="mr-2">➕</span>
              Create New Activity
            </Link>
          )}

          <Link
            href={`/trip/${id}/edit`}
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
            Change Status ({trip.status})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Trip Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="text-sm text-gray-500">Date</div>
            <div className="font-medium">
              {trip.date
                ? new Date(trip.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Not specified"}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="text-sm text-gray-500">Status</div>
            <div className="font-medium capitalize">{trip.status}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="text-sm text-gray-500">Total</div>
            <div className="font-medium">${totalTripMoney}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="text-sm text-gray-500">Total Collected</div>
            <div className="font-medium text-green-600">
              ${totalCollectedMoney}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="text-sm text-gray-500">Total Debt</div>
            <div className="font-medium text-red-600">
              ${totalDebtMoney.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Payers</h3>
          <div className="flex flex-wrap gap-3">
            {payersWithNames.map((payer, idx) => (
              <div
                key={idx}
                className="flex items-center bg-blue-50 rounded-full px-4 py-2 shadow-sm hover:shadow transition"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-2">
                  {payer.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{payer.name}</div>
                  <div className="text-sm text-gray-600">
                    ${payer.spentMoney}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">
            Participants
          </h3>
          <div className="flex flex-wrap gap-3">
            {participantsWithTotals.map((participant, idx) => (
              <div
                key={idx}
                className="flex items-center bg-gray-50 rounded-full px-4 py-2 shadow-sm hover:shadow transition"
              >
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold mr-2">
                  {participant.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{participant.name}</div>
                  <div className="text-sm">
                    {participant.remainingToPay > 0 && (
                      <span className="text-red-500">
                        Owes: ${participant.remainingToPay.toFixed(2)}
                      </span>
                    )}
                    {participant.remainingToPay < 0 && (
                      <span className="text-green-500">
                        To receive: $
                        {Math.abs(participant.remainingToPay).toFixed(2)}
                      </span>
                    )}
                    {Math.abs(participant.remainingToPay) < 0.01 && (
                      <span className="text-gray-500">Settled</span>
                    )}
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
          {activities.map((activity) => {
            const payer = users.find((u) => u.id === activity.payerId);
            return (
              <li key={activity.id} className="py-2">
                <Link
                  href={`/activity/${activity.id}`}
                  className="block hover:bg-gray-50 rounded p-3 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{activity.name}</span> -
                      <span className="text-gray-600">
                        {payer?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="font-semibold">${activity.totalMoney}</div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(activity.time).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}{" "}
                    {new Date(activity.time).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {showPaymentForm && (
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

      {/* Warning modal remains unchanged */}
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
      )}
    </div>
  );
}
