import { NextRequest, NextResponse } from 'next/server';
import dailySpendingLogService from '@/app/services/dailySpendingLogService';
import { CreateDailySpendingLogPayload } from '@/app/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let response;

    if (date) {
      // Fetch log for specific date
      response = await dailySpendingLogService.fetchDailySpendingLogByDate(userId, date);
    } else if (startDate && endDate) {
      // Fetch logs within date range
      response = await dailySpendingLogService.getSpendingByDateRange(userId, startDate, endDate);
    } else {
      // Fetch all logs for user
      response = await dailySpendingLogService.fetchAllDailySpendingLogs(userId);
    }

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

    const body: CreateDailySpendingLogPayload = await request.json();

    // Validate required fields
    if (!body.date || body.amountSpent === undefined) {
      return NextResponse.json(
        { error: 'Date and amount spent are required' },
        { status: 400 }
      );
    }

    if (body.amountSpent < 0) {
      return NextResponse.json(
        { error: 'Amount spent must be non-negative' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return NextResponse.json(
        { error: 'Date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    const response = await dailySpendingLogService.createDailySpendingLog(userId, body);

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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body: CreateDailySpendingLogPayload = await request.json();

    // Validate required fields
    if (!body.date || body.amountSpent === undefined) {
      return NextResponse.json(
        { error: 'Date and amount spent are required' },
        { status: 400 }
      );
    }

    if (body.amountSpent < 0) {
      return NextResponse.json(
        { error: 'Amount spent must be non-negative' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return NextResponse.json(
        { error: 'Date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    const response = await dailySpendingLogService.upsertDailySpendingLog(userId, body);

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