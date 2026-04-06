import { useAuthStore } from "../store/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Standardized API Response structure matching the backend
 */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  success: boolean;
}

const getToken = (): string | null => useAuthStore.getState().token;

const buildHeaders = (options: RequestInit, withAuth: boolean): HeadersInit => {
  const isFormData = options.body instanceof FormData;
  const token = getToken();
  return {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Standardized request function.
 * Returns the full ApiResponse<T> object, which includes status, message, data, and success.
 * Components can access the data via .data (e.g., res.data).
 */
export async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true,
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(options, withAuth),
  });

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Request failed with status ${res.status}`);
  }

  // Handle both fetch OK status and backend success flag
  if (!res.ok || !json.success) {
    throw new Error(json?.message || `Request failed with status ${res.status}`);
  }

  return json;
}
