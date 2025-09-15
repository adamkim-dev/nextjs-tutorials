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

  // Lấy 5 chuyến đi gần nhất
  const recentTrips = trips.slice(0, 5);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Recent Trips</h1>
          <Link
            href="/trips"
            className="text-blue-500 hover:underline text-lg"
          >
            View All Trips
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTrips.length > 0 ? (
            recentTrips.map((trip) => (
              <div key={trip.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold">{trip.name}</h2>
                <p>Date: {trip.date}</p>
                <p>Total: ${trip.totalMoney}</p>
                <Link
                  href={`/trips/${trip.id}`}
                  className="text-blue-500 hover:underline"
                >
                  View Details
                </Link>
              </div>
            ))
          ) : (
            <p>No trips found. Create your first trip!</p>
          )}
        </div>

        <div className="mt-8 flex space-x-4">
          <Link
            href="/create-trip"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create New Trip
          </Link>
          <Link
            href="/trips"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Go to My Trips
          </Link>
        </div>
      </div>
    </main>
  );
}
