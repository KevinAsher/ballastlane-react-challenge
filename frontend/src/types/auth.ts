export interface User {
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}
