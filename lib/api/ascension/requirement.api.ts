import { request } from "../base";
import type {
  AscensionRequirement,
  CreateAscensionRequirementDTO,
  UpdateAscensionRequirementDTO,
  BulkUpsertRequirementsDTO,
} from "../../types";

const BASE = "/ascension/requirements";

export const requirementApi = {
  getForStage: (stageId: number) =>
    request<{ data: AscensionRequirement[] }>(`${BASE}?stage_id=${stageId}`),

  getById: (id: number) =>
    request<{ data: AscensionRequirement }>(`${BASE}/${id}`),

  upsert: (body: CreateAscensionRequirementDTO) =>
    request<{ data: AscensionRequirement }>(BASE, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateAscensionRequirementDTO) =>
    request<{ data: AscensionRequirement }>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<{ data: null }>(`${BASE}/${id}`, { method: "DELETE" }),

  bulk: (body: BulkUpsertRequirementsDTO) =>
    request<{ data: AscensionRequirement[] }>(`${BASE}/bulk`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
