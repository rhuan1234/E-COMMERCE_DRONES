import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, finalize, of, shareReplay, tap, throwError } from 'rxjs';
import { AuthUser } from '../../models/auth/AuthUser';
import { LoginRequest } from '../../models/auth/LoginRequest';
import { LoginResponse } from '../../models/auth/LoginResponse';
import { RegisterRequest } from '../../models/auth/RegisterRequest';

/** Perfis emitidos pelo Keycloak/backend para controle de acesso. */
export type PerfilAcesso = 'ADMIN' | 'CLIENTE';

interface SessaoToken {
  login: string;
  email: string | null;
  perfis: string[];
  expiraEm: number | null;
}

const CHAVE_TOKEN = 'token';
const CHAVE_REFRESH_TOKEN = 'refreshToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080';

  /** Token atual; o cabeçalho da loja e o painel reagem a ele sem recarregar a página. */
  private readonly token = signal<string | null>(lerArmazenamento(CHAVE_TOKEN));
  private readonly refreshToken = signal<string | null>(lerArmazenamento(CHAVE_REFRESH_TOKEN));
  private readonly usuarioAtual = signal<AuthUser | null>(null);
  private refreshEmAndamento$: Observable<LoginResponse> | null = null;

  private readonly sessao = computed(() => decodificarToken(this.token()));

  /** Login do usuário autenticado (perfil /auth/me ou claim OIDC), ou null para visitantes. */
  readonly usuario = computed(() => this.usuarioAtual()?.login ?? this.sessaoValida()?.login ?? null);
  readonly emailUsuario = computed(() => this.usuarioAtual()?.email ?? this.sessaoValida()?.email ?? null);
  readonly perfilUsuario = computed(() => this.usuarioAtual());
  readonly roles = computed(() => {
    const sessao = this.sessaoValida();
    if (!sessao) {
      return [];
    }
    const doUsuario = this.usuarioAtual()?.roles ?? [];
    return doUsuario.length > 0 ? doUsuario : sessao.perfis;
  });
  readonly autenticado = computed(() => this.sessaoValida() !== null);
  readonly administrador = computed(() => this.possuiPapel('ADMIN'));

  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl + '/auth/login', dados).pipe(
      tap((response) => this.registrarSessao(response)),
    );
  }

  register(dados: RegisterRequest): Observable<RegisterRequest> {
    return this.http.post<RegisterRequest>(this.apiUrl + '/clientes', dados);
  }

  carregarUsuarioAutenticado(): Observable<AuthUser | null> {
    return this.http.get<AuthUser>(this.apiUrl + '/auth/me').pipe(
      tap((usuario) => this.usuarioAtual.set(usuario)),
      catchError((err) => {
        if (err?.status === 401) {
          this.limparSessaoLocal();
        }
        return of(null);
      }),
    );
  }

  inicializarSessao(): Observable<AuthUser | null> {
    if (!this.autenticado()) {
      return of(null);
    }
    return this.carregarUsuarioAutenticado().pipe(catchError(() => of(null)));
  }

  renovarSessao(): Observable<LoginResponse> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      return throwError(() => new Error('Refresh token ausente'));
    }
    if (!this.refreshEmAndamento$) {
      this.refreshEmAndamento$ = this.http
        .post<LoginResponse>(this.apiUrl + '/auth/refresh', { refreshToken: refresh })
        .pipe(
          tap((response) => this.registrarSessao(response)),
          finalize(() => {
            this.refreshEmAndamento$ = null;
          }),
          shareReplay(1),
        );
    }
    return this.refreshEmAndamento$;
  }

  logout(): void {
    const tokenAtual = this.getToken();
    const refreshAtual = this.getRefreshToken();

    this.limparSessaoLocal();

    if (!refreshAtual && !tokenAtual) {
      return;
    }

    const headers = tokenAtual
      ? new HttpHeaders({ Authorization: `Bearer ${tokenAtual}` })
      : undefined;

    this.http
      .post<void>(
        this.apiUrl + '/auth/logout',
        { refreshToken: refreshAtual },
        headers ? { headers } : undefined,
      )
      .pipe(catchError(() => EMPTY))
      .subscribe();
  }

  limparSessaoLocal(): void {
    removerArmazenamento(CHAVE_TOKEN);
    removerArmazenamento(CHAVE_REFRESH_TOKEN);
    this.token.set(null);
    this.refreshToken.set(null);
    this.usuarioAtual.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  getRefreshToken(): string | null {
    return this.refreshToken();
  }

  isAuthenticated(): boolean {
    return this.autenticado();
  }

  isAdmin(): boolean {
    return this.administrador();
  }

  possuiPapel(papel: PerfilAcesso): boolean {
    return this.roles().includes(papel);
  }

  /** Rota inicial depois do login quando não há returnUrl. */
  destinoPadrao(): string {
    return this.isAdmin() ? '/admin' : '/home';
  }

  private registrarSessao(response: LoginResponse): void {
    salvarArmazenamento(CHAVE_TOKEN, response.token);
    this.token.set(response.token);

    if (response.refreshToken) {
      salvarArmazenamento(CHAVE_REFRESH_TOKEN, response.refreshToken);
      this.refreshToken.set(response.refreshToken);
    }

    if (response.usuario) {
      this.usuarioAtual.set(response.usuario);
    }
  }

  private sessaoValida(): SessaoToken | null {
    const tokenAtual = this.token();
    if (!tokenAtual) {
      return null;
    }
    const sessao = this.sessao();
    // Token opaco (sem payload legível) continua aceito: quem decide é o backend.
    if (!sessao) {
      return { login: '', email: null, perfis: [], expiraEm: null };
    }
    if (sessao.expiraEm !== null && sessao.expiraEm * 1000 <= Date.now()) {
      return null;
    }
    return sessao;
  }
}

function lerArmazenamento(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function salvarArmazenamento(chave: string, valor: string): void {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // Armazenamento indisponível: a sessão vale até recarregar a página.
  }
}

function removerArmazenamento(chave: string): void {
  try {
    localStorage.removeItem(chave);
  } catch {
    // Nada a remover.
  }
}

/** Lê o payload do JWT (OIDC Keycloak ou legado) apenas para decidir a navegação; a autorização real é do backend. */
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
    const claims = JSON.parse(json) as {
      preferred_username?: string;
      upn?: string;
      sub?: string;
      email?: string;
      groups?: unknown;
      realm_access?: { roles?: unknown };
      resource_access?: Record<string, { roles?: unknown }>;
      exp?: number;
    };

    const perfis = new Set<string>();
    if (Array.isArray(claims.realm_access?.roles)) {
      for (const role of claims.realm_access.roles) {
        if (typeof role === 'string') {
          perfis.add(role);
        }
      }
    }
    if (claims.resource_access && typeof claims.resource_access === 'object') {
      for (const acesso of Object.values(claims.resource_access)) {
        if (Array.isArray(acesso?.roles)) {
          for (const role of acesso.roles) {
            if (typeof role === 'string') {
              perfis.add(role);
            }
          }
        }
      }
    }
    if (Array.isArray(claims.groups)) {
      for (const grupo of claims.groups) {
        if (typeof grupo === 'string') {
          perfis.add(grupo);
        }
      }
    }

    return {
      login: claims.preferred_username ?? claims.upn ?? claims.sub ?? '',
      email: typeof claims.email === 'string' ? claims.email : null,
      perfis: Array.from(perfis),
      expiraEm: typeof claims.exp === 'number' ? claims.exp : null,
    };
  } catch {
    return null;
  }
}
