const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

const authHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const plainHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
});

export async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: withAuth ? authHeaders() : plainHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}