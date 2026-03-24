import { request } from "../base";
import type {
  SkillLevel,
  SkillLevelRequirement,
  UpsertSkillLevelDTO,
  UpdateSkillLevelDTO,
  UpsertSkillLevelRequirementDTO,
  UpdateSkillLevelRequirementDTO,
  BulkUpsertSkillLevelRequirementsDTO,
} from "../../types";

// UPDATED: was /skills/levels, now /skill-levels
const BASE = "/skill-levels";

export const skillLevelApi = {
  // ── LEVELS ───────────────────────────────────────────────────────────────

  getForSkill: (skillId: number) =>
    request<{ data: SkillLevel[] }>(`${BASE}?skill_id=${skillId}`),

  getById: (id: number) => request<{ data: SkillLevel }>(`${BASE}/${id}`),

  upsert: (body: UpsertSkillLevelDTO) =>
    request<{ data: SkillLevel }>(BASE, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateSkillLevelDTO) =>
    request<{ data: SkillLevel }>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<{ data: null }>(`${BASE}/${id}`, { method: "DELETE" }),

  // ── REQUIREMENTS ─────────────────────────────────────────────────────────

  getRequirements: (skillLevelId: number) =>
    request<{ data: SkillLevelRequirement[] }>(
      `${BASE}/${skillLevelId}/requirements`,
    ),

  getRequirementById: (id: number) =>
    request<{ data: SkillLevelRequirement }>(`${BASE}/requirements/${id}`),

  upsertRequirement: (body: UpsertSkillLevelRequirementDTO) =>
    request<{ data: SkillLevelRequirement }>(`${BASE}/requirements`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateRequirement: (id: number, body: UpdateSkillLevelRequirementDTO) =>
    request<{ data: SkillLevelRequirement }>(`${BASE}/requirements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteRequirement: (id: number) =>
    request<{ data: null }>(`${BASE}/requirements/${id}`, { method: "DELETE" }),

  bulkRequirements: (
    skillLevelId: number,
    body: BulkUpsertSkillLevelRequirementsDTO,
  ) =>
    request<{ data: SkillLevelRequirement[] }>(
      `${BASE}/${skillLevelId}/requirements/bulk`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),
};
