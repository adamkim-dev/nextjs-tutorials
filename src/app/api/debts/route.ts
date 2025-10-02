import { NextRequest, NextResponse } from 'next/server';
import debtService from '@/app/services/debtService';
import { CreateDebtPayload } from '@/app/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const response = await debtService.fetchAllDebts(userId);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: response.data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body: CreateDebtPayload = await request.json();

    if (!body.creditor || typeof body.creditor !== 'string') {
      return NextResponse.json(
        { error: 'Creditor is required and must be a string' },
        { status: 400 }
      );
    }

    if (typeof body.amountRemaining !== 'number' || body.amountRemaining < 0) {
      return NextResponse.json(
        { error: 'Amount remaining must be a non-negative number' },
        { status: 400 }
      );
    }

    if (typeof body.monthlyPayment !== 'number' || body.monthlyPayment < 0) {
      return NextResponse.json(
        { error: 'Monthly payment must be a non-negative number' },
        { status: 400 }
      );
    }

    const response = await debtService.createDebt(userId, body);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: response.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}