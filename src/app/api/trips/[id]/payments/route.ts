import { NextRequest, NextResponse } from "next/server";
import { PaymentHistory, TripParticipant } from "@/app/models";
import { v4 as uuidv4 } from "uuid";

const API_URL = "http://localhost:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch payment history from json-server
  const response = await fetch(`${API_URL}/paymentHistory?tripId=${id}`);
  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch payment history" },
      { status: 500 }
    );
  }

  return NextResponse.json(await response.json());
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payment = (await request.json()) as PaymentHistory;

  // Kiểm tra trạng thái trip trước khi thêm payment
  const tripResponse = await fetch(`${API_URL}/trips/${id}`);
  if (!tripResponse.ok) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const trip = await tripResponse.json();
  if (trip.status !== "on-going") {
    return NextResponse.json(
      { error: "Payments can only be processed for on-going trips" },
      { status: 403 }
    );
  }

  // Generate UUID for new payment
  const paymentWithId = {
    ...payment,
    id: uuidv4(),
  };

  // Add payment to history via json-server
  const paymentResponse = await fetch(`${API_URL}/paymentHistory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentWithId),
  });

  if (!paymentResponse.ok) {
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }

  // Fetch trip to update participant's paid amount
  const updatedTripResponse = await fetch(`${API_URL}/trips/${id}`);
  if (!updatedTripResponse.ok) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  await updatedTripResponse.json(); // Validate response data

  // Update trip participant's paid amount
  const participantIndex = trip.participants.findIndex(
    (p: TripParticipant) => p.userId === payment.userId
  );
  if (participantIndex >= 0) {
    const participant = trip.participants[participantIndex];
    participant.paidAmount = (participant.paidAmount || 0) + payment.amount;

    // Update isPaid status if fully paid
    if (participant.paidAmount >= participant.totalMoneyPerUser) {
      participant.isPaid = true;
    }

    // Thêm ID thanh toán mới vào mảng paymentHistory của trip
    if (!trip.paymentHistory) {
      trip.paymentHistory = [];
    }
    trip.paymentHistory.push(paymentWithId.id);

    // Update trip via json-server
    const updateTripResponse = await fetch(`${API_URL}/trips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip),
    });

    if (!updateTripResponse.ok) {
      return NextResponse.json(
        { error: "Failed to update trip" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(paymentWithId, { status: 201 });
}
