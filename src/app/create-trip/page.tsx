/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, TripStatus } from "@/app/models";
import Link from "next/link";
import tripService from "../services/tripService";
import userService from "../services/userService";

export default function CreateTrip() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [tripName, setTripName] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State cho modal thêm user mới
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await userService.fetchAllUsers();
    if (response.data) {
      setUsers(response.data);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create participants array from selected users
      const participants = selectedUsers.map((userId) => ({
        userId,
        isPaid: false,
        totalMoneyPerUser: 0,
      }));

      // Create new trip object
      const newTrip = {
        name: tripName,
        date: tripDate,
        participants,
        status: "planed" as TripStatus,
        total_money: 0,
        money_per_user: 0,
      } as any;

      // Sử dụng tripService để tạo trip mới
      const response = await tripService.createTrip(newTrip);

      if (response.data) {
        router.push(`/trip/${response.data.id}`);
      } else {
        throw new Error("Failed to create trip");
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      alert("Failed to create trip. Please try again.");
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

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPhone) {
      alert("Please fill in all user information");
      return;
    }

    setIsAddingUser(true);

    try {
      // Tạo đối tượng user mới
      const newUser = {
        name: newUserName,
        email: newUserEmail,
        phoneNumber: newUserPhone,
      };

      // Gửi request để tạo user mới
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const createdUser = await response.json();

        // Cập nhật danh sách users
        setUsers((prev) => [...prev, createdUser]);

        // Tự động chọn user mới
        setSelectedUsers((prev) => [...prev, createdUser.id]);

        // Reset form
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPhone("");
        setShowAddUserModal(false);

        // Hiển thị thông báo thành công
        alert("User added successfully!");
      } else {
        throw new Error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user. Please try again.");
    } finally {
      setIsAddingUser(false);
    }
  };

  // Reset form khi đóng modal
  const handleCloseModal = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
    setShowAddUserModal(false);
  };

  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-gray-50 text-foreground">
      <header className="py-4 text-center text-xl font-bold flex items-center justify-between bg-white rounded-lg shadow p-4 mb-6">
        <Link href="/" className="text-blue-500 hover:text-blue-700 transition">
          <span>⬅️</span> Back
        </Link>
        <span className="text-2xl">Create New Trip</span>
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Participants
              </label>
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="text-sm text-blue-500 hover:text-blue-700 transition flex items-center gap-1"
              >
                <span>➕ Add New User</span>
              </button>
            </div>

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
              <span>✨</span>
              {isLoading ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal thêm user mới */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add New User</h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                ❌
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition mr-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddUser}
                  disabled={
                    isAddingUser ||
                    !newUserName ||
                    !newUserEmail ||
                    !newUserPhone
                  }
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600 transition flex items-center gap-1"
                >
                  {isAddingUser ? "Adding..." : "Add User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
