import { request } from "../base";
import type {
  AscensionRequirement,
  CreateAscensionRequirementDTO,
  UpdateAscensionRequirementDTO,
  BulkUpsertRequirementsDTO,
} from "../../types";

const BASE = "/requirements";

export const requirementApi = {
  // Matching backend: GET /requirements?stage_id=XXX
  getForStage: (stageId: number) =>
    request<AscensionRequirement[]>(`${BASE}?stage_id=${stageId}`),

  getById: (id: number) =>
    request<AscensionRequirement>(`${BASE}/${id}`),

  upsert: (body: CreateAscensionRequirementDTO) =>
    request<AscensionRequirement>(BASE, {
      method: "PUT", // Updated to match backend .put("/")
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateAscensionRequirementDTO) =>
    request<AscensionRequirement>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<null>(`${BASE}/${id}`, { method: "DELETE" }),

  bulk: (body: BulkUpsertRequirementsDTO) =>
    request<AscensionRequirement[]>(`${BASE}/bulk`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
