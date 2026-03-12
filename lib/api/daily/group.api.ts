import { request } from "../base";
import type { Group, SubGroup } from "../../types";

export const groupsApi = {
  getByCategoryId: (categoryId: number) =>
    request<{ data: Group[] }>(`/groups/category/${categoryId}`),

  create: (body: Omit<Group, "id">) =>
    request<{ data: Group }>("/groups", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Group) =>
    request<{ data: Group }>(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<{ data: Group }>(`/groups/${id}`, { method: "DELETE" }),
};

export const subGroupsApi = {
  getByGroupId: (groupId: number) =>
    request<{ data: SubGroup[] }>(`/groups/sub/${groupId}`),

  create: (body: Omit<SubGroup, "id">) =>
    request<{ data: SubGroup }>("/groups/sub", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: SubGroup) =>
    request<{ data: SubGroup }>(`/groups/sub/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<{ data: SubGroup }>(`/groups/sub/${id}`, { method: "DELETE" }),
};
