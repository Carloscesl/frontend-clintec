export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombreUser: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  id: number;
  nombreUser: string;
  email: string;
  token: string;
  roles: string[];
}
