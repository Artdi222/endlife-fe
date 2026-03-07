import { request } from "./base";
import type { LoginDTO, LoginResponse, RegisterDTO,RegisternResponse } from "../types";

export const authApi = {
  login: (body: LoginDTO) =>
    request<{ data: LoginResponse }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(body) },
      false,
    ),
    register: (body: RegisterDTO) =>
      request<{data:RegisternResponse}>(
        "/auth/register",
        {method: "POST", body: JSON.stringify(body) },
        false
      )
};
