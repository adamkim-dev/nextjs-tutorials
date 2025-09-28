"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { User, Trip, TripParticipant, NewActivityPayload } from "@/app/models";
import Link from "next/link";
import tripService from "@/app/services/tripService";
import activityService from "@/app/services/activityService";
import useUsers from "@/app/hooks/useUsers";
import useTrips from "@/app/hooks/useTrips";

interface ActivityFormData {
  activityName: string;
  activityTime: string;
  totalMoney: string;
  payerId: string;
  participants: string[];
}

export default function CreateActivity() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const { tripDetail, isLoading } = useTrips({
    tripId: id as string,
  });
  const { getUserById } = useUsers();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ActivityFormData>({
    defaultValues: {
      activityName: "",
      activityTime: new Date().toISOString().slice(0, 16),
      totalMoney: "",
      payerId: "",
      participants: [],
    },
  });

  const formValues = watch();

  useEffect(() => {
    console.log("Form values changed:", formValues);
  }, [formValues]);

  const onSubmit = async (data: ActivityFormData) => {
    const { activityName, totalMoney, payerId, participants, activityTime } =
      data;
    try {
      const moneyPerUser =
        parseFloat(data.totalMoney) / selectedParticipants.length;

      const participants = selectedParticipants.map((userId) => ({
        id: userId,
        totalMoneyPerUser: moneyPerUser,
      }));

      const newActivity = {
        tripId: id as string,
        name: activityName,
        totalMoney: parseFloat(totalMoney),
        payerId,
        participants,
      } as NewActivityPayload;

      const response = await activityService.createActivity(newActivity);

      if (response.data) {
        const createdActivity = response.data;

        if (tripDetail) {
          // Kiểm tra xem người trả tiền đã có trong danh sách payers chưa
          const updatedPayers = [...(tripDetail.payers || [])];
          const existingPayerIndex = updatedPayers.findIndex(
            (p) => p.userId === payerId
          );

          if (existingPayerIndex >= 0) {
            // Nếu người trả tiền đã tồn tại, cập nhật số tiền đã chi
            updatedPayers[existingPayerIndex].spentMoney += parseFloat(
              data.totalMoney
            );
          } else {
            // Nếu người trả tiền chưa tồn tại, thêm mới vào danh sách
            updatedPayers.push({
              userId: data.payerId,
              spentMoney: parseFloat(data.totalMoney),
            });
          }

          // Cập nhật trip với payers mới và thêm activity vào danh sách
          // const updatedTrip = {
          //   ...trip,
          //   payers: updatedPayers,
          //   totalMoney: (trip.totalMoney || 0) + parseFloat(data.totalMoney),
          //   activities: [...(trip.activities || []), createdActivity.id],
          // };

          // await tripService.updateTrip(tripId as string, {
          //   payers: updatedTrip.payers,
          //   totalMoney: updatedTrip.totalMoney,
          //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
          //   activities: updatedTrip.activities as any[],
          // });
        }

        router.push(`/trips/${id}`);
      } else {
        throw new Error("Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      alert("Failed to create activity. Please try again.");
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
          href={`/trips/${id}`}
          className="text-blue-500 hover:text-blue-700 transition"
        >
          <i className="fas fa-arrow-left"></i> Back
        </Link>
        <span className="text-2xl">Create New Activity</span>
        <div className="w-8"></div>
      </header>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Activity Information
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Activity Name
              </label>
              <input
                type="text"
                {...register("activityName", {
                  required: "Activity name is required",
                })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter activity name"
              />
              {errors.activityName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.activityName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Date & Time
              </label>
              <input
                type="datetime-local"
                {...register("activityTime", {
                  required: "Date and time is required",
                })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              {errors.activityTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.activityTime.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Total Money
              </label>
              <input
                type="number"
                {...register("totalMoney", {
                  required: "Total money is required",
                  min: { value: 0, message: "Amount must be positive" },
                  validate: (value) =>
                    parseFloat(value) > 0 || "Amount must be greater than 0",
                })}
                min="0"
                step="0.01"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="0.00"
              />
              {errors.totalMoney && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.totalMoney.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Payer
              </label>
              <select
                {...register("payerId", { required: "Please select a payer" })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Select a payer</option>
                {tripDetail?.participants.map((par) => (
                  <option key={par.userId} value={par.userId}>
                    {getUserById(par.userId)?.name || "Unknown User"}
                  </option>
                ))}
              </select>
              {errors.payerId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.payerId.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Select Participants
            </label>
            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto bg-gray-50">
              {isLoading ? (
                <p className="text-gray-500 p-4 text-center">
                  Loading users...
                </p>
              ) : tripDetail && tripDetail?.participants?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {tripDetail?.participants.map((par) => (
                    <div
                      key={par.userId}
                      className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <input
                        type="checkbox"
                        id={`participant-${par.userId}`}
                        checked={selectedParticipants.includes(par.userId)}
                        onChange={() => toggleParticipantSelection(par.userId)}
                        className="mr-3 h-5 w-5 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                          {getUserById(par.userId)
                            ?.name.charAt(0)
                            .toUpperCase() || "U"}
                        </div>
                        <label
                          htmlFor={`participant-${par.userId}`}
                          className="cursor-pointer"
                        >
                          {getUserById(par.userId)?.name || "Unknown User"}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 p-4 text-center">
                  No participants available
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
              disabled={isLoading || selectedParticipants.length === 0}
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
