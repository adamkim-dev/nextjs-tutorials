"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Activity, User } from "@/app/models";

export default function ActivityDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch(`/api/activities/${id}`)
      .then((res) => res.json())
      .then(setActivity);

    fetch(`/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, [id]);

  if (!activity) return <div>Loading...</div>;

  // Find payer name
  const payer = users.find((u) => u.id === activity.payerId);

  // Calculate money per user
  const moneyPerUser = activity.totalMoney / activity.participants.length;

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(`/trip/${activity.tripId}`);
      } else {
        throw new Error("Failed to delete activity");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("Failed to delete activity");
      setIsDeleting(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-background text-foreground">
      <header className="py-4 text-center text-xl font-bold">
        {activity.name}
        <button onClick={() => router.push(`/trip/${activity.tripId}`)}>
          Go back
        </button>
      </header>

      <div className="space-y-2 mb-4">
        <div>Date: {new Date(activity.time).toLocaleString()}</div>
        <div>Payer: {payer?.name || "Unknown"}</div>
        <div>Total Cost: ${activity.totalMoney}</div>
      </div>

      <div className="mt-4 font-semibold">Participants:</div>
      <ul className="divide-y">
        {activity.participants.map((p, idx) => {
          const participant = users.find((u) => u.id === p.userId);
          return (
            <li key={idx} className="py-2 flex justify-between items-center">
              <div>{participant?.name || "Unknown"}</div>
              <div>${p.totalMoneyPerUser}</div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 p-3 rounded-lg">
        <div className="font-semibold">Money Per User:</div>
        <div className="text-xl">${moneyPerUser.toFixed(2)}</div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => router.push(`/activity/${id}/edit`)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded"
        >
          Edit Activity
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          {isDeleting ? "Deleting..." : "Delete Activity"}
        </button>
      </div>
    </div>
  );
}
