import { request } from "./base";
import type {
  DailyChecklistRow,
  UpdateTaskProgressDTO,
  ActivityLevelResult,
  GlobalProgressResult,
  SanityTracker,
  UpdateSanityDTO,
  SanityResult,
} from "../types/daily.types";

export const dailyApi = {
  // GET /daily/:userId/:date
  // Ambil seluruh checklist harian user untuk tanggal tertentu
  getChecklist: (userId: number, date: string) =>
    request<{ data: DailyChecklistRow[] }>(`/daily/${userId}/${date}`, {}, false),

  // POST /daily/progress
  // Update progress satu task (increment/set current_progress)
  updateProgress: (body: UpdateTaskProgressDTO) =>
    request<{ data: UpdateTaskProgressDTO }>(
      "/daily/progress",
      { method: "POST", body: JSON.stringify(body) },
      false,
    ),

  // GET /daily/:userId/:date/activity
  // Ambil activity level user hari ini (0–100, dari category "Operation Manual (Daily)")
  getActivityLevel: (userId: number, date: string) =>
    request<{ data: ActivityLevelResult }>(
      `/daily/${userId}/${date}/activity`,
      {},
      false,
    ),

  // GET /daily/:userId/:date/global
  // Ambil progress global per category (berapa category sudah selesai semua task-nya)
  getGlobalProgress: (userId: number, date: string) =>
    request<{ data: GlobalProgressResult }>(
      `/daily/${userId}/${date}/global`,
      {},
      false,
    ),

  // GET /daily/:userId/sanity
  // Ambil current sanity & max sanity user (auto-regen setiap 7m12s per point)
  getSanity: (userId: number) =>
    request<{ data: SanityResult }>(`/daily/${userId}/sanity`, {}, false),

  // POST /daily/sanity
  // Set current_sanity & max_sanity secara manual
  updateSanity: (body: UpdateSanityDTO) =>
    request<{ data: SanityTracker }>(
      "/daily/sanity",
      { method: "POST", body: JSON.stringify(body) },
      false,
    ),

  // POST /daily/:userId/sanity/empty
  // Kosongkan current_sanity user menjadi 0
  emptySanity: (userId: number) =>
    request<{ data: SanityTracker }>(
      `/daily/${userId}/sanity/empty`,
      { method: "POST" },
      false,
    ),
};