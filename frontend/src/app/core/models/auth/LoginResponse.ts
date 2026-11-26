import { AuthUser } from './AuthUser';

export interface LoginResponse {
  token: string;
  tipo?: string;
  refreshToken?: string;
  expiresIn?: number;
  usuario?: AuthUser;
}
