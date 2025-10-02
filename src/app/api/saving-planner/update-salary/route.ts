import { NextRequest, NextResponse } from 'next/server';
import savingPlannerService from '@/app/services/savingPlannerService';
import { UpdateUserSalaryPayload } from '@/app/models';

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body: UpdateUserSalaryPayload = await request.json();

    if (typeof body.salary !== 'number' || body.salary < 0) {
      return NextResponse.json(
        { error: 'Salary must be a non-negative number' },
        { status: 400 }
      );
    }

    const response = await savingPlannerService.updateUserSalary(userId, body);

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { success: response.data } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}