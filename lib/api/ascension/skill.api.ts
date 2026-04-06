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
    request<SkillWithLevels[]>(`${BASE}?character_id=${characterId}`),

  getById: (id: number) => request<SkillWithLevels>(`${BASE}/${id}`),

  create: (body: CreateSkillDTO) =>
    request<Skill>(BASE, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateSkillDTO) =>
    request<Skill>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<null>(`${BASE}/${id}`, { method: "DELETE" }),

  uploadIcon: (id: number, formData: FormData) =>
    request<Skill>(`${BASE}/${id}/icon`, {
      method: "POST",
      body: formData,
    }),
};
