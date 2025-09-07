"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useTrips from "./hooks/useTrips";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const { data: trips, isLoading, isError, error } = useTrips();

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Your Trips</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <div key={trip.id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold">{trip.name}</h2>
              <p>Date: {trip.date}</p>
              <p>Total: ${trip.totalMoney}</p>
              <Link
                href={`/trip/${trip.id}`}
                className="text-blue-500 hover:underline"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/create-trip"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create New Trip
          </Link>
        </div>
      </div>
    </main>
  );
}
