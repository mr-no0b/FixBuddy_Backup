// Utility function to create consistent API responses

import { NextResponse } from 'next/server';

export function successResponse(data: any, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      ...data,
    },
    { status }
  );
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
