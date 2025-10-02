import { NextRequest, NextResponse } from 'next/server';
import savingPlanService from '@/app/services/savingPlanService';
import { CreateSavingPlanPayload } from '@/app/models';

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

    const response = await savingPlanService.fetchAllSavingPlans(userId);

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

    const body: CreateSavingPlanPayload = await request.json();

    // Validate required fields
    if (!body.type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

    // Validate that either percentage or fixed amount is provided
    if (!body.percentageOfSalary && !body.fixedAmount) {
      return NextResponse.json(
        { error: 'Either percentage of salary or fixed amount must be provided' },
        { status: 400 }
      );
    }

    // Validate that both are not provided
    if (body.percentageOfSalary && body.fixedAmount) {
      return NextResponse.json(
        { error: 'Cannot provide both percentage of salary and fixed amount' },
        { status: 400 }
      );
    }

    // Validate percentage range
    if (body.percentageOfSalary !== undefined && (body.percentageOfSalary < 0 || body.percentageOfSalary > 100)) {
      return NextResponse.json(
        { error: 'Percentage of salary must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate fixed amount
    if (body.fixedAmount !== undefined && body.fixedAmount < 0) {
      return NextResponse.json(
        { error: 'Fixed amount must be non-negative' },
        { status: 400 }
      );
    }

    const response = await savingPlanService.createSavingPlan(userId, body);

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