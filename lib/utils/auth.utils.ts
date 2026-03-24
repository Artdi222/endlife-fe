import { useAuthStore } from "../store/auth.store";

export function getUserId(): number | null {
  return useAuthStore.getState().user?.user_id ?? null;
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}
