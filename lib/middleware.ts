import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

export interface AuthRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware to authenticate JWT tokens from cookies or Authorization header
 */
export function authenticate(
  handler: (req: AuthRequest) => Promise<NextResponse>
) {
  return async (req: AuthRequest): Promise<NextResponse> => {
    try {
      // Get token from cookie or Authorization header
      const tokenFromCookie = req.cookies.get('token')?.value;
      const authHeader = req.headers.get('authorization');
      const tokenFromHeader = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;

      const token = tokenFromCookie || tokenFromHeader;

      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify token
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Attach user to request
      req.user = decoded;

      // Call the original handler
      return handler(req);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

/**
 * Optional authentication - doesn't require token but attaches user if present
 */
export function optionalAuth(
  handler: (req: AuthRequest) => Promise<NextResponse>
) {
  return async (req: AuthRequest): Promise<NextResponse> => {
    try {
      const tokenFromCookie = req.cookies.get('token')?.value;
      const authHeader = req.headers.get('authorization');
      const tokenFromHeader = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;

      const token = tokenFromCookie || tokenFromHeader;

      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          req.user = decoded;
        }
      }

      return handler(req);
    } catch (error) {
      // Continue without authentication
      return handler(req);
    }
  };
}
