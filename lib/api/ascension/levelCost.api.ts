import { request } from "../base";
import type {
  LevelCost,
  UpsertLevelCostDTO,
} from "../../types";

const BASE = "/level-costs";

export const levelCostApi = {
  // Matching backend: GET /level-costs?entity_type=character|weapon
  getAll: (entityType: "character" | "weapon") =>
    request<LevelCost[]>(
      `${BASE}?entity_type=${entityType}`,
    ),

  // Matching backend: GET /level-costs/range?entity_type=character|weapon&from_level=XX&to_level=YY
  getRange: (entityType: "character" | "weapon", from: number, to: number) =>
    request<{ total_exp: string; total_credits: string }>(
      `${BASE}/range?entity_type=${entityType}&from_level=${from}&to_level=${to}`,
    ),

  upsert: (body: UpsertLevelCostDTO) =>
    request<LevelCost>(BASE, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
