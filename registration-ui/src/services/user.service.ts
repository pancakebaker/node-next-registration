// src/services/user.service.ts
'use client';
import { HttpClient } from './http.client';
import {
  ApiEnvelope, 
  LoginEnvelope,
  AuthUser,
} from './api.types';
import { UserDetails, UserPersonalInfo } from '@/schemas/user.schema';
import { API_ENDPOINTS, PAGE_LINKS, TOKENS, USER_MESSAGES } from '@/lib/constants';

type ControllerOptions = { apiBaseUrl?: string };

/**
 * Client-side user service.
 *
 * Responsibilities
 * - Wraps HTTP calls to the Registration API (register, login, profile).
 * - Persists tokens in `localStorage` and mirrors them in cookies for SSR/middleware.
 * - Exposes auth helpers (read/clear token, observe token changes).
 *
 * Storage model
 * - Access/refresh tokens are stored under {@link TOKENS.ACCESS} and {@link TOKENS.REFRESH} in `localStorage`.
 * - On login, httpOnly cookies are **not** set by the API, so this service sets non-httpOnly
 *   cookies client-side (SameSite=Lax) for middleware/server components to read.
 * - On logout, both `localStorage` and cookies are cleared.
 */
class UserServiceImpl {
  /** Normalized API base URL (without a trailing slash). */
  private readonly apiBaseUrl: string;
  /** Wrapped HTTP client with auth injection & error normalization. */
  private readonly http: HttpClient;
  /** Interval id for token polling (used by {@link observeToken}). */
  private tokenWatchTimer?: number;

  /**
   * @param opts Optional overrides for the API base URL. Defaults to `NEXT_PUBLIC_API_BASE` or `http://localhost:4000`.
   */
  constructor(opts?: ControllerOptions) {
    this.apiBaseUrl = (opts?.apiBaseUrl ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000')
      .replace(/\/+$/, '');
    this.http = new HttpClient(
      this.apiBaseUrl,
      () => this.getToken(),
      () => this.clearToken()
    );
  }

  /**
   * Reads the access token from `localStorage`.
   * @returns Access token string or `null` (SSR-safe).
   */
  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKENS.ACCESS);
  }

  /**
   * Persists the access token to `localStorage`.
   * @param token Access token (JWT).
   */
  setToken(token: string) {
    if (typeof window !== 'undefined') localStorage.setItem(TOKENS.ACCESS, token);
  }

  /**
   * Persists the refresh token to `localStorage`.
   * @param token Refresh token (opaque string/JWT).
   */
  setRefreshToken(token: string) {
    if (typeof window !== 'undefined') localStorage.setItem(TOKENS.REFRESH, token);
  }

  /**
   * Clears tokens from both `localStorage` and cookies.
   * Safe to call on client only; no-ops on server.
   */
  clearToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKENS.ACCESS);
    localStorage.removeItem(TOKENS.REFRESH);
    if (typeof document !== 'undefined') {
      document.cookie = `${TOKENS.ACCESS}=; Path=/; Max-Age=0; SameSite=Lax`;
      document.cookie = `${TOKENS.REFRESH}=; Path=/; Max-Age=0; SameSite=Lax`;
    }
  }

  /**
   * Indicates whether an access token is present in client storage.
   * Note: This does not validate expiry.
   */
  isAuthenticated() { return !!this.getToken(); }

  /**
   * Observes changes to the access token and invokes a callback.
   *
   * Mechanism
   * - Listens to the `storage` event for cross-tab sync.
   * - Polls at a small interval as a fallback for same-tab mutations.
   *
   * @param callback Invoked with the latest token or `null`.
   * @param intervalMs Polling interval, defaults to 500ms.
   * @returns Cleanup function to remove listeners/interval.
   */
  observeToken(callback: (token: string | null) => void, intervalMs = 500) {
    if (typeof window === 'undefined') return;
    let last = this.getToken();
    callback(last);

    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKENS.ACCESS) { last = e.newValue; callback(last); }
    };
    window.addEventListener('storage', onStorage);
    this.tokenWatchTimer = window.setInterval(() => {
      const curr = this.getToken();
      if (curr !== last) { last = curr; callback(last); }
    }, intervalMs);

    return () => {
      window.removeEventListener('storage', onStorage);
      if (this.tokenWatchTimer) {
        clearInterval(this.tokenWatchTimer);
        this.tokenWatchTimer = undefined;
      }
    };
  }

  /**
   * Registers a new user.
   *
   * @param payload Full user details collected by the registration wizard.
   * @returns A normalized envelope `{ success, data, message }`.
   */
  async register(payload: UserDetails): Promise<ApiEnvelope<unknown>> {
    const data = await this.http.request<ApiEnvelope<unknown>>(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      json: payload,
    });
    return { success: !!data?.success, data: data?.data, message: data?.message };
  }

  /**
   * Logs in a user and stores tokens in localStorage and cookies.
   *
   * Cookies
   * - Access token cookie Max-Age is derived from the JWT `exp` when available; otherwise 1 hour.
   * - Refresh token cookie defaults to 30 days.
   *
   * @param identifier Username or email.
   * @param password   Plain text password.
   * @returns `{ accessToken, refreshToken, user }` where `user` is {@link AuthUser}.
   * @throws Error with a friendly message on failure.
   */
  async login(identifier: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
    const env = await this.http.request<LoginEnvelope>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      json: { identifier, password },
    });
    if (!env?.success || !env.data) throw new Error(USER_MESSAGES.LOGIN_ERROR);
    const { accessToken, refreshToken, user } = env.data;
    this.setToken(accessToken);
    this.setRefreshToken(refreshToken);

    if (typeof document !== 'undefined') {
      const maxAgeFromJwt = (() => {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          if (payload?.exp) {
            const secs = Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
            return Number.isFinite(secs) ? secs : null;
          }
          return null;
        } catch { return null; }
      })();

      const maxAge = maxAgeFromJwt ?? 60 * 60; // fallback: 1 hour

      document.cookie = `${TOKENS.ACCESS}=${encodeURIComponent(accessToken)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
      document.cookie = `${TOKENS.REFRESH}=${encodeURIComponent(refreshToken)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }

    const authUser: AuthUser = {
      id: user.id, name: user.name, username: user.username, email: user.email,
    };
    return { accessToken, refreshToken, user: authUser };
  }

  /**
   * Fetches the current user's profile (for client-side screens).
   * @returns {@link UserPersonalInfo} for the authenticated user.
   * @throws Error when the profile cannot be loaded.
   */
  async getMe(): Promise<UserPersonalInfo> {
    const me = await this.http.request<UserPersonalInfo>(API_ENDPOINTS.PROFILE_ME, { method: 'GET' });
    if (!me) throw new Error(USER_MESSAGES.PROFILE_LOAD_ERROR);
    return me;
  }

  /**
   * Updates personal profile fields.
   * Trims `middleName` and converts empty to `null` for a consistent API payload.
   */
  async updatePersonal(input: {
    name: string; middleName?: string | null; familyName: string; mobile: string; email: string;
  }): Promise<void> {
    const payload = {
      ...input,
      middleName: input.middleName?.trim() ? input.middleName.trim() : null,
    };
    await this.http.request(API_ENDPOINTS.PROFILE_PERSONAL, { method: 'PUT', json: payload });
  }

  /**
   * Updates account info (username/password).
   * Password/confirm fields are optional; omit when not changing password.
   */
  async updateAccount(input: { username: string; password?: string; confirmPassword?: string; }): Promise<void> {
    await this.http.request(API_ENDPOINTS.PROFILE_ACCOUNT, { method: 'PUT', json: input });
  }

  /**
   * Lightweight loader for dashboards: verifies local auth and fetches profile.
   *
   * - If not authenticated (no access token), returns a redirect target to {@link PAGE_LINKS.LOGIN}.
   * - Otherwise returns the hydrated user object.
   *
   * @returns `{ user }` on success, or `{ user: null, redirectTo }` when unauthenticated.
   */
  async load(): Promise<{ user: UserPersonalInfo | null; redirectTo?: string }> {
    if (!this.isAuthenticated()) return { user: null, redirectTo: PAGE_LINKS.LOGIN };
    const user = await this.getMe();
    return { user };
  }

  /**
   * Clears all local auth state (tokens in storage and cookies).
   * Intended to be called on explicit logout or when detecting auth errors.
   */
  logout() {
    this.clearToken();
  }
}

export const UserService = new UserServiceImpl();
export type { UserServiceImpl };
