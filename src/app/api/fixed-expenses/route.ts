import { NextRequest, NextResponse } from 'next/server';
import fixedExpenseService from '@/app/services/fixedExpenseService';
import { CreateFixedExpensePayload } from '@/app/models';

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

    const response = await fixedExpenseService.fetchAllFixedExpenses(userId);

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

    const body: CreateFixedExpensePayload = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    if (typeof body.amount !== 'number' || body.amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be a non-negative number' },
        { status: 400 }
      );
    }

    if (body.frequency !== 'monthly' && body.frequency !== 'weekly') {
      return NextResponse.json(
        { error: 'Frequency must be either "monthly" or "weekly"' },
        { status: 400 }
      );
    }

    const response = await fixedExpenseService.createFixedExpense(userId, body);

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