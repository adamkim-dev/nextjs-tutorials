"use client";

import Link from "next/link";
import useTrips from "../hooks/useTrips";

export default function TripsPage() {
  const { data: trips } = useTrips({});

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-2.5">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="flex flex-col justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">All Your Trips</h1>
        </div>
        <div className="my-4 w-full flex justify-end">
          <Link
            href="/create-trip"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + New Trip
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <div key={trip.id} className="border p-4 rounded-lg">
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
          ))}
        </div>
      </div>
    </main>
  );
}
