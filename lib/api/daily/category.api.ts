import { request } from "../base";
import type { Category } from "../../types";

export const categoriesApi = {
  getAll: () => request<{ data: Category[] }>("/categories"),

  create: (body: Omit<Category, "id">) =>
    request<{ data: Category }>("/categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Omit<Category, "id">) =>
    request<{ data: Category }>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<{ data: Category }>(`/categories/${id}`, { method: "DELETE" }),
};
