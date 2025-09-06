"use client";

import { PaymentHistory, Trip, User } from "@/app/models";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentHistoryPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch trip data
    fetch(`/api/trips/${id}`)
      .then((res) => res.json())
      .then(setTrip);

    // Fetch payment history
    fetch(`/api/trips/${id}/payments`)
      .then((res) => res.json())
      .then(setPayments);

    // Fetch users
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers);
  }, [id]);

  if (!trip) return <div>Loading...</div>;

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-background text-foreground">
      <header className="py-4 text-center text-xl font-bold flex items-center justify-between">
        <Link href={`/trip/${id}`} className="text-blue-500">
          <i className="fas fa-arrow-left"></i> Quay lại
        </Link>
        <span>Payment History: {trip.name}</span>
      </header>

      {payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No records</div>
      ) : (
        <ul className="divide-y">
          {payments.map((payment) => {
            const user = users.find((u) => u.id === payment.userId);
            return (
              <li key={payment.id} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">
                      {user?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="font-bold">${payment.amount}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(payment.paymentDate).toLocaleString()}
                </div>
                {payment.note && (
                  <div className="text-sm italic mt-1">{payment.note}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
