# Serviços HTTP, Contratos de API e Gestão de Sessão

Este documento estabelece as diretrizes para a criação e manutenção de serviços Angular com `HttpClient`, alinhamento estrito aos contratos da API REST Quarkus e gerenciamento de estado de autenticação e sessão.

---

## 1. Estrutura Padrão de um Serviço HTTP

Todos os serviços HTTP devem ser fornecidos na raiz da aplicação (`providedIn: 'root'`) e retornar `Observable<T>` tipados explicitamente.

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse } from '../models/PagedResponse';
import { Marca } from '../models/marca/Marca';
import { MarcaRequest } from '../models/marca/MarcaRequest';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/marcas';

  findAll(page: number = 0, pageSize: number = 10, nome?: string): Observable<PagedResponse<Marca>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (nome && nome.trim()) {
      params = params.set('nome', nome.trim());
    }

    return this.http.get<PagedResponse<Marca>>(this.baseUrl, { params });
  }

  findById(id: number): Observable<Marca> {
    return this.http.get<Marca>(`${this.baseUrl}/${id}`);
  }

  create(marca: MarcaRequest): Observable<Marca> {
    return this.http.post<Marca>(this.baseUrl, marca);
  }

  update(id: number, marca: MarcaRequest): Observable<Marca> {
    return this.http.put<Marca>(`${this.baseUrl}/${id}`, marca);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

## 2. Contratos Padronizados da API (`backend-response.md`)

O frontend consome uma API que segue os padrões documentados em `frontend/docs/backend-response.md`.

### 2.1 Resposta Paginada (`PagedResponse<T>`)
```typescript
export interface PagedResponse<T> {
  items: T[];           // Ou data: T[] a depender do endpoint mapeado
  page: number;
  pageSize: number;
  totalItems: number;   // Ou totalElements
  totalPages: number;
}
```

### 2.2 Respostas com Envelope Genérico (`ApiResponse<T>`)
```typescript
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}
```

### 2.3 Respostas de Erro (`ApiErrorResponse`)
```typescript
export interface ApiFieldError {
  field: string;
  issue: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  error: {
    code: string;
    details?: ApiFieldError[];
  };
}
```

---

## 3. Gestão de Sessão, JWT e Autenticação

A autenticação é baseada em JSON Web Token (JWT) assimétrico.

### 3.1 Ciclo do Token JWT
1. **Login**: O endpoint `POST /auth/login` retorna `{ token: string }`.
2. **Armazenamento**: O token é salvo em `localStorage.setItem('token', token)`.
3. **Anexo em Requisições**: O interceptor HTTP anexa `Authorization: Bearer <token>` em todas as requisições autenticadas.
4. **Logout**: Remove o token do storage e redireciona o usuário para `/login`.

### 3.2 Interceptor de Autenticação (`AuthInterceptor`)
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './AuthService';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(clonedReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
```

### 3.3 Guards de Rota (`CanActivateFn`)
```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './AuthService';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.hasRole('ADMIN')) {
    return true;
  }
  return router.createUrlTree(['/home']);
};
```

---

## 4. ⛔ Regra de Ouro: Proibição de Endpoints ou Campos Inventados

> [!CRITICAL]
> **O frontend NUNCA deve inventar rotas HTTP, parâmetros de query ou atributos em modelos TypeScript.**
> 
> Toda interface e requisição deve derivar estritamente de:
> 1. Controllers REST do Quarkus (`backend/src/main/java/drones/resources/`).
> 2. Records DTO existentes (`backend/src/main/java/drones/dto/`).
> 3. Documentação de domínio (`docs/REGRAS_NEGOCIO.md` e `docs/CONTEXTO_PROJETO.md`).
>
> Se uma tela necessitar de dados não fornecidos pela API existente, a pendência deve ser reportada ao desenvolvedor/usuário para que o backend seja estendido formalmente.
