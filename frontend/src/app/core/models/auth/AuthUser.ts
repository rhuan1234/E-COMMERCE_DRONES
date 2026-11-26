export interface AuthUser {
  id: number;
  keycloakId?: string | null;
  login: string;
  email: string;
  nomeCompleto?: string | null;
  perfil: 'ADMIN' | 'CLIENTE';
  roles: string[];
}
