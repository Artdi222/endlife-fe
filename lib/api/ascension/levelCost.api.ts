import { request } from "../base";
import type {
  LevelCost,
  UpsertLevelCostDTO,
} from "../../types";

export const levelCostApi = {
  getAll: (entityType: "character" | "weapon") =>
    request<{ data: LevelCost[] }>(
      `/ascension/level-costs?entity_type=${entityType}`,
    ),

  getRange: (entityType: "character" | "weapon", from: number, to: number) =>
    request<{ data: { total_exp: string; total_credits: string } }>(
      `/ascension/level-costs/range?entity_type=${entityType}&from=${from}&to=${to}`,
    ),

  upsert: (body: UpsertLevelCostDTO) =>
    request<{ data: LevelCost }>("/ascension/level-costs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
