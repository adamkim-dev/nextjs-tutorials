import { Trip } from "@/app/models";
import { NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Lấy dữ liệu trip từ json-server
  const tripResponse = await fetch(`${API_URL}/trips/${id}`);
  console.log("🚀 ~ GET ~ tripResponse:", tripResponse);

  if (!tripResponse.ok) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  // Lấy dữ liệu trip
  const trip = await tripResponse.json();

  // Nếu dữ liệu không đầy đủ (chỉ có id và status), lấy lại toàn bộ dữ liệu
  if (trip && Object.keys(trip).length <= 2 && trip.id && trip.status) {
    // Lấy tất cả trips
    const allTripsResponse = await fetch(`${API_URL}/trips`);
    if (allTripsResponse.ok) {
      const allTrips = await allTripsResponse.json();
      // Tìm trip đầy đủ theo id
      const fullTrip = allTrips.find((t: Trip) => t.id === id);
      if (fullTrip) {
        return NextResponse.json(fullTrip);
      }
    }
  }

  // Trả về dữ liệu trip đã lấy được
  return NextResponse.json(trip);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tripId = id;
  const updatedFields = await request.json();

  // Lấy dữ liệu trip hiện tại
  const tripResponse = await fetch(`${API_URL}/trips/${tripId}`);

  if (!tripResponse.ok) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const currentTrip = await tripResponse.json();

  // Kết hợp dữ liệu hiện tại với các trường cần cập nhật
  const mergedTrip = { ...currentTrip, ...updatedFields };

  // Gửi dữ liệu đã kết hợp đến json-server
  const response = await fetch(`${API_URL}/trips/${tripId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mergedTrip),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    );
  }

  // Lấy dữ liệu trip sau khi cập nhật
  const updatedTripResponse = await fetch(`${API_URL}/trips/${tripId}`);
  if (!updatedTripResponse.ok) {
    return NextResponse.json(
      { error: "Failed to get updated trip" },
      { status: 500 }
    );
  }

  const updatedTrip = await updatedTripResponse.json();

  // Nếu dữ liệu không đầy đủ (chỉ có id và status), lấy lại toàn bộ dữ liệu
  if (
    updatedTrip &&
    Object.keys(updatedTrip).length <= 2 &&
    updatedTrip.id &&
    updatedTrip.status
  ) {
    // Lấy tất cả trips
    const allTripsResponse = await fetch(`${API_URL}/trips`);
    if (allTripsResponse.ok) {
      const allTrips = await allTripsResponse.json();
      // Tìm trip đầy đủ theo id
      const fullTrip = allTrips.find((t: Trip) => t.id === tripId);
      if (fullTrip) {
        return NextResponse.json(fullTrip);
      }
    }
  }

  return NextResponse.json(updatedTrip);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const response = await fetch(`${API_URL}/trips/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  return NextResponse.json(await response.json());
}
