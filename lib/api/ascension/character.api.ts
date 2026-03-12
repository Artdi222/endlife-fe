import { request } from "../base";
import type {
  Character,
  CreateCharacterDTO,
  UpdateCharacterDTO,
} from "../../types";

export const charactersApi = {
  getAll: () => request<{ data: Character[] }>("/characters"),

  getById: (id: number) => request<{ data: Character }>(`/characters/${id}`),

  create: (body: CreateCharacterDTO) =>
    request<{ data: Character }>("/characters", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateCharacterDTO) =>
    request<{ data: Character }>(`/characters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  uploadMedia: (
    id: number,
    field: "icon" | "splash_art" | "video_enter" | "video_idle",
    file: File,
  ) => {
    const form = new FormData();
    form.append("field", field);
    form.append("file", file);
    // Use fetch directly — request() sets Content-Type: application/json
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token")
        : null;
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/characters/${id}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then((r) => r.json()) as Promise<{ data: Character }>;
  },

  delete: (id: number) =>
    request<{ data: null }>(`/characters/${id}`, { method: "DELETE" }),
};
