"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Activity, ActivityParticipant } from "@/app/models";
import Link from "next/link";
import activityService from "@/app/services/activityService";
import userService from "@/app/services/userService";

export default function EditActivity() {
  const { id } = useParams();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [activityName, setActivityName] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [totalMoney, setTotalMoney] = useState("");
  const [payerId, setPayerId] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [tripId, setTripId] = useState<string>("");

  // Fetch activity, trip and users when component mounts
  useEffect(() => {
    const fetchData = async () => {
      // Fetch activity details using activityService
      const activityResponse = await activityService.fetchActivityById(
        id as string
      );
      if (activityResponse.data) {
        const data = activityResponse.data;
        setActivity(data);
        setActivityName(data.name);
        setActivityTime(data.time);
        setTotalMoney(data.totalMoney.toString());
        setPayerId(data.payerId);
        setTripId(data.tripId);
        setSelectedParticipants(
          data.participants.map((p: ActivityParticipant) => p.userId)
        );

        // Fetch all users using userService
        const usersResponse = await userService.fetchAllUsers();
        if (usersResponse.data) {
          setUsers(usersResponse.data);
        }
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!activity) return;

      // Calculate money per user
      const moneyPerUser = parseFloat(totalMoney) / selectedParticipants.length;

      // Create updated participants array
      const updatedParticipants = selectedParticipants.map((userId) => {
        // Check if participant already exists
        const existingParticipant = activity.participants.find(
          (p) => p.userId === userId
        );

        if (existingParticipant) {
          return {
            ...existingParticipant,
            totalMoneyPerUser: moneyPerUser,
          };
        }

        // If new participant
        return {
          userId,
          totalMoneyPerUser: moneyPerUser,
        };
      });

      // Create updated activity object
      const updatedActivity = {
        name: activityName,
        time: activityTime,
        totalMoney: parseFloat(totalMoney),
        payerId,
        participants: updatedParticipants,
      };

      // Use activityService to update activity
      const response = await activityService.updateActivity(
        id as string,
        updatedActivity
      );

      if (response.data) {
        router.push(`/trip/${activity.tripId}`);
      } else {
        throw new Error("Failed to update activity");
      }
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("Failed to update activity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleParticipantSelection = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (!activity) return <div>Loading activity details...</div>;

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-gray-50 text-foreground">
      <header className="py-4 text-center text-xl font-bold flex items-center justify-between bg-white rounded-lg shadow p-4 mb-6">
        <Link
          href={`/trip/${tripId}`}
          className="text-blue-500 hover:text-blue-700 transition"
        >
          <span>⬅️</span> Back
        </Link>
        <span className="text-2xl">Edit Activity: {activity.name}</span>
        <div className="w-8"></div> {/* Spacer for balance */}
      </header>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Activity Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Activity Name
              </label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter activity name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={activityTime}
                onChange={(e) => setActivityTime(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Total Money
              </label>
              <input
                type="number"
                value={totalMoney}
                onChange={(e) => setTotalMoney(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Payer
              </label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Select a payer</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Select Participants
            </label>
            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto bg-gray-50">
              {users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <input
                        type="checkbox"
                        id={`participant-${user.id}`}
                        checked={selectedParticipants.includes(user.id)}
                        onChange={() => toggleParticipantSelection(user.id)}
                        className="mr-3 h-5 w-5 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <label
                          htmlFor={`participant-${user.id}`}
                          className="cursor-pointer"
                        >
                          {user.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 p-4 text-center">
                  Loading users...
                </p>
              )}
            </div>
            {selectedParticipants.length === 0 && (
              <p className="text-red-500 text-sm mt-2">
                Please select at least one participant
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              disabled={
                isLoading ||
                !activityName ||
                !activityTime ||
                !totalMoney ||
                !payerId ||
                selectedParticipants.length === 0
              }
              className="px-6 py-3 bg-green-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>💾</span>
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
