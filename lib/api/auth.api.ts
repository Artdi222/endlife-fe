import { request } from "./base";
import { useAuthStore } from "../store/auth.store";
import type { LoginDTO, RegisterDTO, AuthResponse } from "../types/auth.types";

export const authApi = {
  login: async (body: LoginDTO): Promise<AuthResponse> => {
    const res = await request<AuthResponse>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(body) },
      false, // no auth header on login
    );
    // Persist token + user into Zustand (and cookie for middleware)
    // res is now ApiResponse<AuthResponse>, so we access data
    useAuthStore.getState().setAuth(res.data.token, res.data.user);
    return res.data;
  },

  register: async (body: RegisterDTO): Promise<AuthResponse> => {
    const res = await request<AuthResponse>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(body) },
      false,
    );
    useAuthStore.getState().setAuth(res.data.token, res.data.user);
    return res.data;
  },

  logout: () => {
    useAuthStore.getState().clearAuth();
  },
};
