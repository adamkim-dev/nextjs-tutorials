"use client";

import { useEffect, useState } from "react";
import { Trip } from "./models";
import Link from "next/link";

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  
  useEffect(() => {
    fetch("/api/trips")
      .then((res) => res.json())
      .then(setTrips);
  }, []);

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-gray-50 text-foreground">
      <header className="py-4 text-center text-xl font-bold bg-white rounded-lg shadow p-4 mb-6">
        <span className="text-2xl">My Trips</span>
      </header>
      
      <main className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">All Trips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {trips.map((trip: Trip) => (
            <div
              key={trip.id}
              className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition flex flex-col gap-2"
            >
              <div className="font-semibold text-lg border-b pb-2">{trip.name}</div>
              <div className="text-sm text-gray-500">Date</div>
              <div className="font-medium">
                {trip.date ? new Date(trip.date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }) : "Not specified"}
              </div>
              <div className="text-sm text-gray-500 mt-2">Total Money</div>
              <div className="font-medium">${trip.totalMoney}</div>
              <Link
                href={`/trip/${trip.id}`}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded text-center hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <span>🔍</span> View Details
              </Link>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/create-trip"
            className="px-6 py-3 bg-green-500 text-white rounded text-center hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>✨</span> Create New Trip
          </Link>
        </div>
      </main>
    </div>
  );
}
