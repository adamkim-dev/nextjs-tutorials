"use client";

import { PaymentHistory, Trip, User } from "@/app/models";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import tripService from "@/app/services/tripService";
import paymentService from "@/app/services/paymentService";
import useUsers from "@/app/hooks/useUsers";
import { Utility } from "@/app/utils";

export default function PaymentHistoryPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Get users from Redux store
  const { data: reduxUsers } = useUsers();
  
  // Set users state from Redux data
  useEffect(() => {
    if (reduxUsers && reduxUsers.length > 0) {
      setUsers(reduxUsers);
    }
  }, [reduxUsers]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch trip data using tripService
      const tripResponse = await tripService.fetchTripById(id as string);
      if (tripResponse.data) {
        setTrip(tripResponse.data);
      }

      // Fetch payment history using paymentService
      const paymentsResponse = await paymentService.fetchPaymentsByTripId(id as string);
      if (paymentsResponse.data) {
        setPayments(paymentsResponse.data);
      }
    };

    fetchData();
  }, [id]);

  if (!trip) return <div>Loading...</div>;

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-background text-foreground">
      <header className="py-4 text-center text-xl font-bold flex items-center justify-between">
        <Link href={`/trips/${id}`} className="text-blue-500">
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
                  <div className="font-bold">${Utility.formatMoney(payment.amount)}</div>
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
