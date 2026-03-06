export type UserRole = "user" | "admin";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}
