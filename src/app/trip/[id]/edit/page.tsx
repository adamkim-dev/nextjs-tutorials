"use client";

import { Trip, TripParticipant, User } from "@/app/models";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import tripService from "@/app/services/tripService";
import userService from "@/app/services/userService";

export default function EditTrip() {
  const { id } = useParams();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [tripName, setTripName] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch trip and users when component mounts
  useEffect(() => {
    const fetchData = async () => {
      // Fetch trip details using tripService
      const tripResponse = await tripService.fetchTripById(id as string);
      if (tripResponse.data) {
        const data = tripResponse.data;
        setTrip(data);
        setTripName(data.name);
        setTripDate(data.date);
        setSelectedUsers(
          data.participants.map((p: TripParticipant) => p.userId)
        );
      }

      // Fetch all users using userService
      const usersResponse = await userService.fetchAllUsers();
      if (usersResponse.data) {
        setUsers(usersResponse.data);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!trip) return;

      // Lấy thông tin người dùng đã có trong trip
      const existingParticipants = trip.participants || [];
      const existingUserIds = existingParticipants.map((p) => p.userId);

      // Tạo mảng participants mới
      const updatedParticipants = selectedUsers.map((userId) => {
        // Nếu người dùng đã có trong trip, giữ nguyên thông tin
        const existingParticipant = existingParticipants.find(
          (p) => p.userId === userId
        );
        if (existingParticipant) return existingParticipant;

        // Nếu là người dùng mới, tạo thông tin mới
        return {
          userId,
          isPaid: false,
          totalMoneyPerUser: 0,
        };
      });

      // Cập nhật trip
      const updatedTrip = {
        ...trip,
        name: tripName,
        date: tripDate,
        participants: updatedParticipants,
      };

      // Use tripService to update trip
      const response = await tripService.updateTrip(id as string, {
        name: updatedTrip.name,
        date: updatedTrip.date,
        participants: updatedTrip.participants.map((p) => ({
          userId: p.userId,
          isPaid: p.isPaid,
          totalMoneyPerUser: p.totalMoneyPerUser,
          paidAmount: 0, // Adding required paidAmount field
        })),
      });

      if (response.data) {
        router.push(`/trip/${id}`);
      } else {
        throw new Error("Failed to update trip");
      }
    } catch (error) {
      console.error("Error updating trip:", error);
      alert("Failed to update trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (!trip) return <div>Loading trip details...</div>;

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-gray-50 text-foreground">
      <header className="py-4 text-center text-xl font-bold flex items-center justify-between bg-white rounded-lg shadow p-4 mb-6">
        <Link
          href={`/trip/${id}`}
          className="text-blue-500 hover:text-blue-700 transition"
        >
          <span>⬅️</span> Back
        </Link>
        <span className="text-2xl">Edit Trip: {trip.name}</span>
        <div className="w-8"></div> {/* Spacer for balance */}
      </header>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Trip Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Trip Name
              </label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter trip name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
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
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="mr-3 h-5 w-5 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <label
                          htmlFor={`user-${user.id}`}
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
            {selectedUsers.length === 0 && (
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
                !tripName ||
                !tripDate ||
                selectedUsers.length === 0
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
