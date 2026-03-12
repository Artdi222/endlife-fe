import { request } from "../base";
import type { Task } from "../../types";

export const tasksApi = {
  getByGroupId: (groupId: number) =>
    request<{ data: Task[] }>(`/tasks/group/${groupId}`),

  getById: (id: number) => request<{ data: Task }>(`/tasks/${id}`),

  create: (body: Omit<Task, "id">) =>
    request<{ data: Task }>("/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Task) =>
    request<{ data: Task }>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<{ data: Task }>(`/tasks/${id}`, { method: "DELETE" }),
};
