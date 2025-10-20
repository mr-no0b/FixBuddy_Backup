// Type definitions for API responses

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    reputation: number;
    avatar?: string | null;
    bio?: string;
    createdAt?: Date;
    lastActiveAt?: Date;
  };
  token?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}
