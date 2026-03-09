export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}
export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthUser {
  user_id: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
export interface RegisterResponse {
  token: string;
  user: AuthUser;
}
