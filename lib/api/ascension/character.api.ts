import { request } from "../base";
import type {
  Character,
  CreateCharacterDTO,
  UpdateCharacterDTO,
} from "../../types";

export const charactersApi = {
  getAll: () => request<Character[]>("/characters"),

  getById: (id: number) => request<Character>(`/characters/${id}`),

  create: (body: CreateCharacterDTO) =>
    request<Character>("/characters", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateCharacterDTO) =>
    request<Character>(`/characters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  uploadMedia: async (
    id: number,
    field: "icon" | "splash_art" | "video_enter" | "video_idle",
    file: File,
  ) => {
    const form = new FormData();
    form.append("field", field);
    form.append("file", file);
    return request<Character>(`/characters/${id}/media`, {
      method: "POST",
      body: form,
    });
  },

  delete: (id: number) =>
    request<null>(`/characters/${id}`, { method: "DELETE" }),
};
