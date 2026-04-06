import { request } from "../base";
import type { Weapon, CreateWeaponDTO, UpdateWeaponDTO } from "../../types";

export const weaponsApi = {
  getAll: () => request<Weapon[]>("/weapons"),

  getById: (id: number) => request<Weapon>(`/weapons/${id}`),

  create: (body: CreateWeaponDTO) =>
    request<Weapon>("/weapons", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateWeaponDTO) =>
    request<Weapon>(`/weapons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  uploadIcon: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<Weapon>(`/weapons/${id}/icon`, {
      method: "POST",
      body: form,
    });
  },

  delete: (id: number) =>
    request<null>(`/weapons/${id}`, { method: "DELETE" }),
};
