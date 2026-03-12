import { request } from "./base";
import type {
  LoginDTO,
  LoginResponse,
  RegisterDTO,
  RegisterResponse,
} from "../types";

export const authApi = {
  login: (body: LoginDTO) =>
    request<{ data: LoginResponse }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(body) },
      false,
    ),
  register: (body: RegisterDTO) =>
    request<{ data: RegisterResponse }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(body) },
      false,
    ),
};
