import { request } from "../base";
import type { Item, CreateItemDTO, UpdateItemDTO } from "../../types";

export const itemsApi = {
  getAll: () => request<{ data: Item[] }>("/items"),

  getById: (id: number) => request<{ data: Item }>(`/items/${id}`),

  create: (body: CreateItemDTO) =>
    request<{ data: Item }>("/items", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateItemDTO) =>
    request<{ data: Item }>(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  uploadImage: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token")
        : null;
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${id}/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then((r) => r.json()) as Promise<{ data: Item }>;
  },

  delete: (id: number) =>
    request<{ data: null }>(`/items/${id}`, { method: "DELETE" }),
};
