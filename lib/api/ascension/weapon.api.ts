import { request } from "../base";
import type { Weapon, CreateWeaponDTO, UpdateWeaponDTO } from "../../types";

export const weaponsApi = {
  getAll: () => request<{ data: Weapon[] }>("/weapons"),

  getById: (id: number) => request<{ data: Weapon }>(`/weapons/${id}`),

  create: (body: CreateWeaponDTO) =>
    request<{ data: Weapon }>("/weapons", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateWeaponDTO) =>
    request<{ data: Weapon }>(`/weapons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  uploadIcon: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token")
        : null;
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/weapons/${id}/icon`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then((r) => r.json()) as Promise<{ data: Weapon }>;
  },

  delete: (id: number) =>
    request<{ data: null }>(`/weapons/${id}`, { method: "DELETE" }),
};
