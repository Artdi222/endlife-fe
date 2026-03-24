import { request } from "../base";
import type {
  Skill,
  SkillWithLevels,
  CreateSkillDTO,
  UpdateSkillDTO,
} from "../../types";

const BASE = "/skills";

export const skillApi = {
  getForCharacter: (characterId: number) =>
    request<{ data: SkillWithLevels[] }>(`${BASE}?character_id=${characterId}`),

  getById: (id: number) => request<{ data: SkillWithLevels }>(`${BASE}/${id}`),

  create: (body: CreateSkillDTO) =>
    request<{ data: Skill }>(BASE, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateSkillDTO) =>
    request<{ data: Skill }>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<{ data: null }>(`${BASE}/${id}`, { method: "DELETE" }),

  uploadIcon: (id: number, formData: FormData) =>
    request<{ data: Skill }>(`${BASE}/${id}/icon`, {
      method: "POST",
      body: formData,
    }),
};
