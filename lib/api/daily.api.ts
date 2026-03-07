import { request } from "./base";
import type {
  DailyChecklistRow,
  UpdateTaskProgressDTO,
  ActivityLevelResult,
  GlobalProgressResult,
  SanityResult,
  UpdateSanityDTO,
} from "../types";

export const dailyApi = {
  getChecklist: (userId: number, date: string) =>
    request<{ data: DailyChecklistRow[] }>(`/daily/${userId}/${date}`),

  updateProgress: (body: UpdateTaskProgressDTO) =>
    request<{ data: UpdateTaskProgressDTO }>("/daily/progress", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getActivityLevel: (userId: number, date: string) =>
    request<{ data: ActivityLevelResult }>(`/daily/${userId}/${date}/activity`),

  getGlobalProgress: (userId: number, date: string) =>
    request<{ data: GlobalProgressResult }>(`/daily/${userId}/${date}/global`),

  getSanity: (userId: number) =>
    request<{ data: SanityResult }>(`/daily/${userId}/sanity`),

  updateSanity: (body: UpdateSanityDTO) =>
    request<{ data: SanityResult }>("/daily/sanity", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  emptySanity: (userId: number) =>
    request<{ data: SanityResult }>(`/daily/${userId}/sanity/empty`, {
      method: "POST",
    }),
};
