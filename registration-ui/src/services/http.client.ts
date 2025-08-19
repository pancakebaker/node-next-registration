// src/services/http.client.ts
import { USER_MESSAGES } from '@/lib/constants';
import { AuthError } from './api.types';

/**
 * Init options for {@link HttpClient.request}.
 *
 * Extends `RequestInit` with:
 * - `json` — any serializable body; if provided, it is `JSON.stringify`-ed and the
 *   `Content-Type: application/json` header is added automatically (unless you override it).
 * - `headers` — optional caller-supplied headers that are **merged** with the client's auth/json headers.
 */
type HttpInit = Omit<RequestInit, 'headers' | 'body'> & {
  json?: unknown;
  headers?: HeadersInit;   // ← allow caller-supplied headers
};

/**
 * Minimal fetch wrapper that:
 * - Injects a Bearer token (when available).
 * - Serializes JSON bodies and parses JSON responses safely.
 * - Normalizes error handling (maps 401 to {@link AuthError} and invokes `onUnauthorized`).
 */
export class HttpClient {
  /**
   * @param baseUrl         Base URL for all requests (e.g. `http://localhost:4000`).
   * @param getToken        Function returning the current access token or `null`.
   * @param onUnauthorized  Callback invoked on HTTP 401 before an {@link AuthError} is thrown.
   */
  constructor(
    private readonly baseUrl: string,
    private getToken: () => string | null,
    private onUnauthorized: () => void
  ) { }

  /**
   * Builds default headers for a request.
   *
   * - Adds `Authorization: Bearer <token>` if a token is available.
   * - Adds `Content-Type: application/json` when `json` is `true`.
   *
   * @param json When `true`, include JSON content-type header.
   * @returns A `HeadersInit` object with auth and optional JSON headers.
   */
  private headers(json = false): HeadersInit {
    const token = this.getToken();
    const h: Record<string, string> = {};
    if (token) h.Authorization = `Bearer ${token}`;
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  /**
   * Safely parses a JSON response body.
   *
   * - Returns `null` for `204 No Content`.
   * - Returns `null` for empty bodies.
   * - Throws if the body is non-empty but invalid JSON.
   *
   * @typeParam T Expected shape of the JSON payload.
   * @param res Fetch `Response`.
   * @returns Parsed JSON as `T` or `null` if empty/204.
   */
  private async parseJsonSafe<T>(res: Response): Promise<T | null> {
    if (res.status === 204) return null;
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : null;
  }

  /**
   * Ensures the response is OK or throws appropriate errors.
   *
   * - On `401`: calls `onUnauthorized()` and throws {@link AuthError}.
   * - On other non-OK responses: attempts to parse `{ message }` and throws `Error(message || "<fallback>: <status>")`.
   *
   * @param res         Fetch response.
   * @param fallbackMsg Message used when server does not provide a JSON `{ message }`.
   * @throws {AuthError} When status is `401 Unauthorized`.
   * @throws {Error}     For any other non-OK status with a user-friendly message.
   */
  private async ensureOk(res: Response, fallbackMsg: string) {
    if (res.status === 401) {
      this.onUnauthorized();
      throw new AuthError();
    }
    if (!res.ok) {
      const data = await this.parseJsonSafe<{ message?: string }>(res);
      throw new Error(data?.message ?? `${fallbackMsg}: ${res.status}`);
    }
  }

  /**
   * Performs an HTTP request against `baseUrl + path`.
   *
   * Features:
   * - Merges auth/JSON headers with caller-supplied headers.
   * - If `init.json` is provided, it is serialized as the request body (and JSON content-type is set).
   * - Throws on non-OK responses (see {@link ensureOk}).
   * - Parses JSON responses and returns `T | null` (`null` for 204/empty bodies).
   *
   * @typeParam T Expected JSON payload from the server.
   * @param path Relative path (e.g., `/api/profile/me`). It is concatenated to `baseUrl` as-is.
   * @param init Additional fetch options. See {@link HttpInit}.
   * @returns Parsed JSON payload as `T` or `null` if no content.
   * @throws {AuthError} When the server returns 401.
   * @throws {Error}     For other non-OK responses with a normalized message.
   *
   * @example
   * ```ts
   * // GET (JSON response)
   * const me = await http.request<User>('/api/profile/me');
   *
   * // POST JSON body
   * await http.request('/api/auth/login', {
   *   method: 'POST',
   *   json: { identifier, password },
   * });
   *
   * // Custom headers merged with defaults
   * await http.request('/api/x', {
   *   headers: { 'X-Trace-Id': traceId },
   * });
   * ```
   */
  async request<T = unknown>(path: string, init: HttpInit = {}): Promise<T | null> {
    const { json, headers: extraHeaders, ...rest } = init;

    const headers: HeadersInit = {
      ...this.headers(Boolean(json)),
      ...(extraHeaders ?? {}),
    };

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...rest,
      headers,
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });

    await this.ensureOk(res, USER_MESSAGES.ERROR);
    return this.parseJsonSafe<T>(res);
  }
}
