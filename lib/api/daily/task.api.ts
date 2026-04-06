import { request } from "../base";
import type { Task } from "../../types";

export const tasksApi = {
  // Matching backend: GET /tasks?group_id=XXX
  getByGroupId: (groupId: number) =>
    request<Task[]>(`/tasks?group_id=${groupId}`),

  getById: (id: number) => request<Task>(`/tasks/${id}`),

  create: (body: Omit<Task, "id">) =>
    request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<Task>(`/tasks/${id}`, { method: "DELETE" }),
};
