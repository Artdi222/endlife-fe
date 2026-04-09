import { request } from "../base";
import type {
  AscensionStageWithRequirements,
  CreateAscensionStageDTO,
  UpdateAscensionStageDTO,
} from "../../types";

const BASE = "/stages";

export const stageApi = {
  getForEntity: (entityType: "character" | "weapon", entityId: number) =>
    request<AscensionStageWithRequirements[]>(
      `${BASE}?entity_type=${entityType}&entity_id=${entityId}`,
    ),

  getById: (id: number) =>
    request<AscensionStageWithRequirements>(`${BASE}/${id}`),

  // UPDATED: was /ascension/level-to-stage, now /ascension/stages/level-to-stage
  levelToStage: (
    entityType: "character" | "weapon",
    entityId: number,
    level: number,
  ) =>
    request<{ stage_number: number }>(
      `${BASE}/level-to-stage?entity_type=${entityType}&entity_id=${entityId}&level=${level}`,
    ),

  create: (body: CreateAscensionStageDTO) =>
    request<AscensionStageWithRequirements>(BASE, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateAscensionStageDTO) =>
    request<AscensionStageWithRequirements>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<null>(`${BASE}/${id}`, { method: "DELETE" }),
};
