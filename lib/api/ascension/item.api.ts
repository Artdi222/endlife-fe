import { request } from "../base";
import type { Item, CreateItemDTO, UpdateItemDTO } from "../../types";

export const itemsApi = {
  getAll: () => request<Item[]>("/items"),

  getById: (id: number) => request<Item>(`/items/${id}`),

  create: (body: CreateItemDTO) =>
    request<Item>("/items", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateItemDTO) =>
    request<Item>(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  uploadImage: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<Item>(`/items/${id}/image`, {
      method: "POST",
      body: form,
    });
  },

  delete: (id: number) =>
    request<null>(`/items/${id}`, { method: "DELETE" }),
};
