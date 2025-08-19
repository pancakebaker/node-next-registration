// utils/response_texts.ts
export const RESPONSE_TEXTS = {
  USER: {
    INVALID_INPUT: 'Invalid input',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email already in use',
    MOBILE_EXISTS: 'Mobile already in use',
    USERNAME_EXISTS: 'Username already in use',
    UNKNOWN: 'Unknown error',
    UNAUTHORIZED: 'Unauthorized',
    PASSWORDS_NO_MATCH: 'Passwords do not match',
  }
} as const;
