"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Trip, TripParticipant } from "@/app/models";
import Link from "next/link";

export default function CreateActivity() {
  const { id: tripId } = useParams();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [tripUsers, setTripUsers] = useState<User[]>([]); // Người dùng trong trip
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activityName, setActivityName] = useState("");
  const [activityTime, setActivityTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [totalMoney, setTotalMoney] = useState("");
  const [payerId, setPayerId] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch trip and users when component mounts
  useEffect(() => {
    // Fetch trip details
    fetch(`/api/trips/${tripId}`)
      .then((res) => res.json())
      .then((tripData) => {
        console.log("🚀 ~ CreateActivity ~ tripData:", tripData);
        setTrip(tripData);

        // Kiểm tra trạng thái trip
        if (tripData.status !== "on-going") {
          alert("Activities can only be created for on-going trips");
          router.push(`/trip/${tripId}`);
          return;
        }

        // Lấy danh sách ID người dùng trong trip
        const tripUserIds = tripData?.participants?.map(
          (p: TripParticipant) => p.userId
        );

        // Fetch tất cả người dùng
        fetch("/api/users")
          .then((res) => res.json())
          .then((allUsers: User[]) => {
            setUsers(allUsers);

            // Lọc ra những người dùng trong trip
            const usersInTrip = allUsers.filter((user) =>
              tripUserIds.includes(user.id)
            );

            setTripUsers(usersInTrip);

            // Mặc định chọn tất cả người dùng trong trip
            setSelectedParticipants(tripUserIds);
          });
      });
  }, [tripId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const moneyPerUser = parseFloat(totalMoney) / selectedParticipants.length;

      // Create participants array from selected users
      const participants = selectedParticipants.map((userId) => ({
        userId,
        isPaid: false,
        totalMoneyPerUser: moneyPerUser,
      }));

      // Create new activity object
      const newActivity = {
        tripId,
        name: activityName,
        time: activityTime,
        totalMoney: parseFloat(totalMoney),
        payerId,
        participants,
      };

      // Send POST request to create activity
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newActivity),
      });

      // Trong hàm handleSubmit, sau khi tạo activity thành công
      if (response.ok) {
        const createdActivity = await response.json();

        // Update trip's activities list and payers
        if (trip) {
          // Kiểm tra xem người trả tiền đã có trong danh sách payers chưa
          const updatedPayers = [...(trip.payers || [])];
          const existingPayerIndex = updatedPayers.findIndex(
            (p) => p.userId === payerId
          );

          if (existingPayerIndex >= 0) {
            // Nếu người trả tiền đã tồn tại, cập nhật số tiền đã chi
            updatedPayers[existingPayerIndex].spentMoney +=
              parseFloat(totalMoney);
          } else {
            // Nếu người trả tiền chưa tồn tại, thêm mới vào danh sách
            updatedPayers.push({
              userId: payerId,
              spentMoney: parseFloat(totalMoney),
            });
          }

          // Cập nhật trip với payers mới và thêm activity vào danh sách
          const updatedTrip = {
            ...trip,
            payers: updatedPayers,
            totalMoney: (trip.totalMoney || 0) + parseFloat(totalMoney),
            activities: [...(trip.activities || []), createdActivity.id],
          };

          // Gửi PUT request để cập nhật trip
          await fetch(`/api/trips/${tripId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTrip),
          });
        }

        router.push(`/trip/${tripId}`);
      } else {
        throw new Error("Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      alert("Failed to create activity. Please try again.");
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

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-gray-50 text-foreground">
      <header className="py-4 text-center text-xl font-bold flex items-center justify-between bg-white rounded-lg shadow p-4 mb-6">
        <Link
          href={`/trip/${tripId}`}
          className="text-blue-500 hover:text-blue-700 transition"
        >
          <i className="fas fa-arrow-left"></i> Back
        </Link>
        <span className="text-2xl">Create New Activity</span>
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
                {tripUsers.map((user) => (
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
              {tripUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {tripUsers.map((user) => (
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
              <span>✨</span>
              {isLoading ? "Creating..." : "Create Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
