import { request } from "./base";
import type {
  NewsBanner,
  CreateNewsBannerDTO,
  UpdateNewsBannerDTO,
} from "../types/newsBanner.types";

export const newsBannersApi = {
  getAll: () => request<NewsBanner[]>("/news-banners"),

  getActive: () => request<NewsBanner[]>("/news-banners/active"),

  getById: (id: number) => request<NewsBanner>(`/news-banners/${id}`),

  create: (body: CreateNewsBannerDTO) =>
    request<NewsBanner>("/news-banners", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: UpdateNewsBannerDTO) =>
    request<NewsBanner>(`/news-banners/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  uploadImage: async (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    // Use the request function for consistency, but base.ts needs to handle FormData body types (it already does for content-type)
    return request<NewsBanner>(`/news-banners/${id}/image`, {
      method: "POST",
      body: form,
    });
  },

  delete: (id: number) =>
    request<null>(`/news-banners/${id}`, { method: "DELETE" }),
};
