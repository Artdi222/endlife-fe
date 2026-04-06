import { request } from "../base";
import type { Group, SubGroup } from "../../types";

export const groupsApi = {
  // Matching backend: GET /groups?category_id=XXX
  getByCategoryId: (categoryId: number) =>
    request<Group[]>(`/groups?category_id=${categoryId}`),

  create: (body: Omit<Group, "id">) =>
    request<Group>("/groups", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Partial<Group>) =>
    request<Group>(`/groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<Group>(`/groups/${id}`, { method: "DELETE" }),
};

export const subGroupsApi = {
  // Matching backend: GET /groups/sub-groups?group_id=XXX
  getByGroupId: (groupId: number) =>
    request<SubGroup[]>(`/groups/sub-groups?group_id=${groupId}`),

  create: (body: Omit<SubGroup, "id">) =>
    request<SubGroup>("/groups/sub-groups", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Partial<SubGroup>) =>
    request<SubGroup>(`/groups/sub-groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<SubGroup>(`/groups/sub-groups/${id}`, { method: "DELETE" }),
};
