import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET() {
  const response = await fetch(`${API_URL}/users`);
  return NextResponse.json(await response.json());
}

export async function POST(request: NextRequest) {
  const newUser = await request.json();
  
  // Tạo UUID v4 cho ID mới
  const userWithId = {
    ...newUser,
    id: uuidv4(),
    spentMoney: 0 // Khởi tạo giá trị mặc định
  };
  
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userWithId)
  });
  
  return NextResponse.json(await response.json(), { status: 201 });
}