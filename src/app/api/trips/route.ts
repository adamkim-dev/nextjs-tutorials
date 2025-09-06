import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const API_URL = "http://localhost:3001";

export async function GET() {
  const response = await fetch(`${API_URL}/trips`);
  const trips = await response.json();
  // Sort trips by date
  const sortedTrips = [...trips].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return NextResponse.json(sortedTrips);
}

export async function POST(request: NextRequest) {
  const newTrip = await request.json();
  
  // Tạo UUID v4 cho ID mới
  const tripWithId = {
    ...newTrip,
    id: uuidv4()
  };
  
  const response = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tripWithId)
  });
  
  return NextResponse.json(await response.json(), { status: 201 });
}
