import { request } from "../base";
import type {
  DailyChecklistRow,
  UpdateTaskProgressDTO,
  ActivityLevelResult,
  GlobalProgressResult,
  SanityResult,
  UpdateSanityDTO,
} from "../../types";

export const dailyApi = {
  // Matching backend: GET /daily?user_id=XXX&date=YYY
  getChecklist: (userId: number, date: string) =>
    request<DailyChecklistRow[]>(`/daily?user_id=${userId}&date=${date}`),

  updateProgress: (body: UpdateTaskProgressDTO) =>
    request<UpdateTaskProgressDTO>("/daily/progress", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Matching backend: GET /daily/activity?user_id=XXX&date=YYY
  getActivityLevel: (userId: number, date: string) =>
    request<ActivityLevelResult>(`/daily/activity?user_id=${userId}&date=${date}`),

  // Matching backend: GET /daily/global-progress?user_id=XXX&date=YYY
  getGlobalProgress: (userId: number, date: string) =>
    request<GlobalProgressResult>(`/daily/global-progress?user_id=${userId}&date=${date}`),

  // Matching backend: GET /daily/sanity/:user_id
  getSanity: (userId: number) =>
    request<SanityResult>(`/daily/sanity/${userId}`),

  updateSanity: (body: UpdateSanityDTO) =>
    request<SanityResult>("/daily/sanity", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Matching backend: POST /daily/sanity/empty/:user_id
  emptySanity: (userId: number) =>
    request<SanityResult>(`/daily/sanity/empty/${userId}`, {
      method: "POST",
    }),
};
