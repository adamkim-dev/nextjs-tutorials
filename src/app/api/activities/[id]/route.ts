import { NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const response = await fetch(`${API_URL}/activities/${id}`);
  
  if (!response.ok) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }
  
  return NextResponse.json(await response.json());
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updatedActivity = await request.json();
  
  const response = await fetch(`${API_URL}/activities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedActivity)
  });
  
  if (!response.ok) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }
  
  return NextResponse.json(await response.json());
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const response = await fetch(`${API_URL}/activities/${id}`, {
    method: "DELETE"
  });
  
  if (!response.ok) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }
  
  return NextResponse.json(await response.json());
}
