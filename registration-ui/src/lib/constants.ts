export const USER_STEPS = ['Personal Information', 'Account Information'] as const;

export const API_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  PROFILE_ME: '/api/profile/me',
  PROFILE_PERSONAL: '/api/profile/personal',
  PROFILE_ACCOUNT: '/api/profile/account',
} as const;

export const USER_DEFAULTS = {
  name: '',
  middleName: '',
  familyName: '',
  email: '',
  mobile: '',
  username: '',
  password: '',
  confirmPassword: '',
} as const;

export const USER_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful!',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  NETWORK_ERROR: 'Network error',
  LOGIN_SUCCESS: 'Login successful! Redirecting…',
  LOGIN_ERROR: 'Login failed',
  PROFILE_SAVE_SUCCESS: 'Personal information saved.',
  PROFILE_LOAD_ERROR: 'Failed to load profile',
  PROFILE_SAVE_ERROR: 'Failed to save personal information.',
  ACCOUNT_SAVE_SUCCESS: 'Account information saved.',
  ACCOUNT_SAVE_ERROR: 'Failed to save account information.',
  ERROR: 'Something went wrong',
  SESSION_EPIRED: 'Your session expired. Please log in again.',
} as const;

export const PAGE_LINKS = {
  REGISTER: '/register',
  LOGIN: '/login',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
} as const;

export const TOKENS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
} as const;