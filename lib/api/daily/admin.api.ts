import { request } from "../base";
import type { AdminCategory } from "../../types";

export const adminApi = {
  getStructure: () => request<{ data: AdminCategory[] }>("/admin/structure"),
};
