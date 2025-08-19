// src/services/api.types.ts
export type ApiEnvelope<T> = {
  success: boolean;          // make this explicit & required
  data?: T;
  message?: string;
};

export type ApiError = { message?: string };

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email: string;
};

export type LoginSuccess = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

// Standardized login response shape across app
export type LoginEnvelope = ApiEnvelope<LoginSuccess>;

export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}
