import { request } from "./base";
import type { LoginDTO, LoginResponse } from "../types";

export const authApi = {
  login: (body: LoginDTO) =>
    request<{ data: LoginResponse }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(body) },
      false,
    ),
};
