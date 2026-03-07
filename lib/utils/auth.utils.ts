export function getUserIdFromToken(): number | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("admin_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id ?? payload.id ?? null;
  } catch {
    return null;
  }
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}
