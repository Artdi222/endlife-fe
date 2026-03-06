import { request } from "./base";
import type { User, CreateUserDTO, UpdateUserDTO } from "../types";

export const usersApi = {
  getAll: () => request<{ data: User[] }>("/users"),

  getById: (id: number) => request<{ data: User }>(`/users/${id}`),

  create: (body: CreateUserDTO) =>
    request<{ data: User }>("/users", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateUserDTO) =>
    request<{ data: User }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<{ data: null }>(`/users/${id}`, { method: "DELETE" }),
};
