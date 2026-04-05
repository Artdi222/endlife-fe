import { request } from "./base";
import type {
  NewsBanner,
  CreateNewsBannerDTO,
  UpdateNewsBannerDTO,
} from "../types/newsBanner.types";

export const newsBannersApi = {
  getAll: () => request<{ data: NewsBanner[] }>("/news-banners"),

  getActive: () => request<{ data: NewsBanner[] }>("/news-banners/active"),

  getById: (id: number) =>
    request<{ data: NewsBanner }>(`/news-banners/${id}`),

  create: (body: CreateNewsBannerDTO) =>
    request<{ data: NewsBanner }>("/news-banners", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateNewsBannerDTO) =>
    request<{ data: NewsBanner }>(`/news-banners/${id}`, {
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
    return fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/news-banners/${id}/image`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      },
    ).then((r) => r.json()) as Promise<{ data: NewsBanner }>;
  },

  delete: (id: number) =>
    request<{ data: null }>(`/news-banners/${id}`, { method: "DELETE" }),
};
