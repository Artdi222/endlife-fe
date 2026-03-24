import { useAuthStore } from "../store/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const getToken = (): string | null => useAuthStore.getState().token;

const buildHeaders = (options: RequestInit, withAuth: boolean): HeadersInit => {
  const isFormData = options.body instanceof FormData;
  const token = getToken();
  return {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(options, withAuth),
  });

  // Safely parse JSON — body may be empty on some errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Request failed with status ${res.status}`);
  }

  if (!res.ok) throw new Error(json?.message || "Request failed");
  return json;
}
