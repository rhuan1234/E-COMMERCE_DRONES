import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../../models/auth/LoginRequest';
import { LoginResponse } from '../../models/auth/LoginResponse';
import { RegisterRequest } from '../../models/auth/RegisterRequest';

/** Perfis emitidos pelo backend na claim "groups" do JWT. */
export type PerfilAcesso = 'ADMIN' | 'CLIENTE';

interface SessaoToken {
  login: string;
  perfis: string[];
  expiraEm: number | null;
}

const CHAVE_TOKEN = 'token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080';

  /** Token atual; o cabeçalho da loja e o painel reagem a ele sem recarregar a página. */
  private readonly token = signal<string | null>(lerTokenArmazenado());

  private readonly sessao = computed(() => decodificarToken(this.token()));

  /** Login do usuário autenticado (claim "upn"), ou null para visitantes. */
  readonly usuario = computed(() => this.sessao()?.login ?? null);
  readonly autenticado = computed(() => this.sessaoValida() !== null);
  readonly administrador = computed(() => this.sessaoValida()?.perfis.includes('ADMIN') ?? false);

  constructor(private http: HttpClient) {}

  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl + '/auth/login', dados).pipe(
      tap((response) => {
        try {
          localStorage.setItem(CHAVE_TOKEN, response.token);
        } catch {
          // Armazenamento indisponível: a sessão vale até recarregar a página.
        }
        this.token.set(response.token);
      }),
    );
  }

  register(dados: RegisterRequest): Observable<RegisterRequest> {
    return this.http.post<RegisterRequest>(this.apiUrl + '/clientes', dados);
  }

  logout(): void {
    try {
      localStorage.removeItem(CHAVE_TOKEN);
    } catch {
      // Nada a remover.
    }
    this.token.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  isAuthenticated(): boolean {
    return this.autenticado();
  }

  isAdmin(): boolean {
    return this.administrador();
  }

  /** Rota inicial depois do login quando não há returnUrl. */
  destinoPadrao(): string {
    return this.isAdmin() ? '/admin' : '/home';
  }

  private sessaoValida(): SessaoToken | null {
    const sessao = this.sessao();
    if (!this.token()) {
      return null;
    }
    // Token opaco (sem payload legível) continua aceito: quem decide é o backend.
    if (!sessao) {
      return { login: '', perfis: [], expiraEm: null };
    }
    if (sessao.expiraEm !== null && sessao.expiraEm * 1000 <= Date.now()) {
      return null;
    }
    return sessao;
  }
}

function lerTokenArmazenado(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

/** Lê o payload do JWT apenas para decidir a navegação; a autorização real é do backend. */
function decodificarToken(token: string | null): SessaoToken | null {
  const payload = token?.split('.')[1];
  if (!payload) {
    return null;
  }
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      Array.from(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')))
        .map((caractere) => '%' + caractere.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    const claims = JSON.parse(json) as { upn?: string; sub?: string; groups?: unknown; exp?: number };
    return {
      login: claims.upn ?? claims.sub ?? '',
      perfis: Array.isArray(claims.groups) ? claims.groups.filter((g): g is string => typeof g === 'string') : [],
      expiraEm: typeof claims.exp === 'number' ? claims.exp : null,
    };
  } catch {
    return null;
  }
}
