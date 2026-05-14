export interface PublicUser {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
