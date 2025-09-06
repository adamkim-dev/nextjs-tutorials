import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const API_URL = "http://localhost:3001";

export async function GET() {
  const response = await fetch(`${API_URL}/activities`);
  const activities = await response.json();
  // Sort activities by time
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.time).getTime() - new Date(a.time).getTime()
  );
  return NextResponse.json(sortedActivities);
}

export async function POST(request: NextRequest) {
  const newActivity = await request.json();
  
  // Kiểm tra trạng thái trip trước khi tạo activity
  const tripResponse = await fetch(`${API_URL}/trips/${newActivity.tripId}`);
  if (!tripResponse.ok) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  
  const trip = await tripResponse.json();
  if (trip.status !== "on-going") {
    return NextResponse.json(
      { error: "Activities can only be created for on-going trips" },
      { status: 403 }
    );
  }
  
  // Tạo UUID v4 cho ID mới
  const activityWithId = {
    ...newActivity,
    id: uuidv4()
  };
  
  const response = await fetch(`${API_URL}/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activityWithId)
  });
  
  return NextResponse.json(await response.json(), { status: 201 });
}