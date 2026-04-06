import { request } from "../base";
import type { Category } from "../../types";

export const categoriesApi = {
  getAll: () => request<Category[]>("/categories"),

  create: (body: Omit<Category, "id">) =>
    request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Omit<Category, "id">) =>
    request<Category>(`/categories/${id}`, {
      method: "PATCH", // Backend refactored to use PATCH for updates
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<Category>(`/categories/${id}`, { method: "DELETE" }),
};
