import { request } from "../base";
import type { User, CreateUserDTO, UpdateUserDTO } from "../../types";

export const usersApi = {
  getAll: () => request<User[]>("/users"),

  getById: (id: number) => request<User>(`/users/${id}`),

  create: (body: CreateUserDTO) =>
    request<User>("/users", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateUserDTO) =>
    request<User>(`/users/${id}`, {
      method: "PATCH", // Backend refactored to use PATCH for updates
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<null>(`/users/${id}`, { method: "DELETE" }),
};
