"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useUsers from "@/app/hooks/useUsers";
import useActivities from "@/app/hooks/useActivities";
import { Utility } from "@/app/utils";
import UserCard from "@/app/components/userCard/UserCard";
import activityService from "@/app/services/activityService";

export default function ActivityDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { activityDetail, isLoading } = useActivities({
    activityId: id as string,
  });
  const { getUserById } = useUsers();

  if (isLoading || !activityDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const payer = getUserById(activityDetail.payerId);
  const moneyPerUser = activityDetail.totalMoney / activityDetail.activityParticipants!.length;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    setIsDeleting(true);
    try {
      const response = await activityService.deleteActivity(id as string);
      if (!response.error) {
        router.push(`/trips/${activityDetail.tripId}`);
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
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push(`/trips/${activityDetail.tripId}`)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Trip
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{activityDetail.name}</h1>
            <div className="w-20"></div> {/* Spacer for alignment */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium mb-1">Total Cost</div>
              <div className="text-2xl font-bold text-blue-900">${Utility.formatMoney(activityDetail.totalMoney)}</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium mb-1">Cost Per Person</div>
              <div className="text-2xl font-bold text-green-900">${Utility.formatMoney(moneyPerUser)}</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium mb-1">Date</div>
              <div className="text-lg font-semibold text-purple-900">
                {Utility.formatDateTime(activityDetail.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Payer Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payer Information</h2>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {payer?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="font-medium text-gray-900">{payer?.name || "Unknown"}</div>
              <div className="text-sm text-gray-500">Paid for this activity</div>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Participants ({activityDetail.activityParticipants!.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activityDetail.activityParticipants!.map((p, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <UserCard user={getUserById(p.userId)!} />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Activity</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push(`/activity/${id}/edit`)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Activity
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {isDeleting ? "Deleting..." : "Delete Activity"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
