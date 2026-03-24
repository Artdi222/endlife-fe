export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// Mirrors JWTPayload from the backend
export interface AuthUser {
  user_id: number;
  username: string;
  email: string; // was missing from old type
  role: "user" | "admin";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Keep these aliases so existing imports don't break
export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;
