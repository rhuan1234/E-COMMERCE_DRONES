# Padrões de Teste e Modelos Prontos (Angular 22 + Vitest)

Este documento contém implementações de referência e padrões canônicos para testes unitários e de integração no frontend, utilizando **Angular 22**, **Vitest**, **Signals**, **Angular Material** e **Tailwind CSS**.

---

## 1. Teste de Componente com Signals e Reatividade de DOM

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { DroneListComponent } from './drone-list';
import { DroneService } from '../../../../core/services/DroneService';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { Drone } from '../../../../core/models/drone/Drone';

describe('DroneListComponent', () => {
  let fixture: ComponentFixture<DroneListComponent>;
  let component: DroneListComponent;
  let droneServiceMock: { listar: ReturnType<typeof vi.fn> };

  const mockDrones: Drone[] = [
    {
      id: 1,
      nome: 'Drone DJI Mini 4 Pro',
      precoOriginal: 5500.0,
      precoComDesconto: 4950.0,
      quantidadeDisponivel: 10,
      imagens: [{ id: 1, url: 'drone1.jpg', principal: true }]
    }
  ];

  const mockResponse: PagedResponse<Drone> = {
    data: mockDrones,
    meta: { page: 0, size: 10, totalElements: 1, totalPages: 1 }
  };

  beforeEach(async () => {
    droneServiceMock = {
      listar: vi.fn().mockReturnValue(of(mockResponse))
    };

    await TestBed.configureTestingModule({
      imports: [DroneListComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: DroneService, useValue: droneServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DroneListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('deve renderizar a listagem de drones no DOM', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Drone DJI Mini 4 Pro');
    expect(compiled.textContent).toContain('R$ 4.950,00');
  });

  it('deve exibir mensagem de estado vazio quando não houver drones', async () => {
    droneServiceMock.listar.mockReturnValue(of({
      data: [],
      meta: { page: 0, size: 10, totalElements: 0, totalPages: 0 }
    }));

    component.carregarDrones();
    fixture.detectChanges();
    await fixture.whenStable();

    const emptyState = fixture.nativeElement.querySelector('[data-testid="empty-state"]');
    expect(emptyState?.textContent).toContain('Nenhum drone encontrado');
  });
});
```

---

## 2. Teste de Formulário Reativo (Validação, Erro de Backend e Prevenção de Envio Duplicado)

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { DroneFormComponent } from './drone-form';
import { DroneService } from '../../../../core/services/DroneService';
import { MarcaService } from '../../../../core/services/MarcaService';
import { ModeloService } from '../../../../core/services/ModeloService';

describe('DroneFormComponent', () => {
  let fixture: ComponentFixture<DroneFormComponent>;
  let component: DroneFormComponent;
  let droneServiceMock: { salvar: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    droneServiceMock = {
      salvar: vi.fn().mockReturnValue(of({ success: true, data: { id: 10 } }))
    };

    await TestBed.configureTestingModule({
      imports: [DroneFormComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: DroneService, useValue: droneServiceMock },
        { provide: MarcaService, useValue: { listarTodas: vi.fn().mockReturnValue(of([])) } },
        { provide: ModeloService, useValue: { listarPorMarca: vi.fn().mockReturnValue(of([])) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DroneFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('deve manter o botão de salvar desabilitado se campos obrigatórios estiverem vazios', () => {
    component.form.patchValue({ nome: '', preco: null, estoque: null });
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('deve desabilitar botão e evitar múltiplos disparos durante submissão (Prevenção de Envio Duplicado)', async () => {
    component.form.patchValue({
      nome: 'Drone Profissional X',
      marcaId: 1,
      modeloId: 1,
      precoOriginal: 3000,
      quantidadeDisponivel: 5
    });
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);

    // Simula cliques múltiplos rápidos
    submitBtn.click();
    submitBtn.click();
    submitBtn.click();

    expect(droneServiceMock.salvar).toHaveBeenCalledTimes(1);
  });

  it('deve mapear erros 400 da API (VALIDATION_ERROR) diretamente nos campos do formulário', async () => {
    const errorResponse = {
      status: 400,
      error: {
        success: false,
        message: 'Dados inválidos.',
        error: {
          code: 'VALIDATION_ERROR',
          details: [{ field: 'nome', issue: 'Nome do drone já cadastrado.' }]
        }
      }
    };
    droneServiceMock.salvar.mockReturnValue(throwError(() => errorResponse));

    component.form.patchValue({
      nome: 'Drone Duplicado',
      marcaId: 1,
      modeloId: 1,
      precoOriginal: 2000,
      quantidadeDisponivel: 2
    });

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.form.get('nome')?.hasError('serverError')).toBe(true);
    const matError = fixture.nativeElement.querySelector('mat-error');
    expect(matError?.textContent).toContain('Nome do drone já cadastrado.');
  });
});
```

---

## 3. Teste de Serviço HTTP com `HttpTestingController`

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DroneService } from './DroneService';
import { Drone } from '../models/drone/Drone';

describe('DroneService', () => {
  let service: DroneService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DroneService
      ]
    });
    service = TestBed.inject(DroneService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Garante que não restaram requisições pendentes
  });

  it('deve buscar lista paginada de drones com query params corretos', () => {
    const mockData = {
      success: true,
      data: [{ id: 1, nome: 'Drone Alpha' }],
      meta: { page: 0, size: 20, totalElements: 1, totalPages: 1 }
    };

    service.listar(0, 20).subscribe(response => {
      expect(response.data.length).toBe(1);
      expect(response.data[0].nome).toBe('Drone Alpha');
      expect(response.meta.totalElements).toBe(1);
    });

    const req = httpMock.expectOne(request => 
      request.url.includes('/api/drones') &&
      request.params.get('page') === '0' &&
      request.params.get('size') === '20'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('deve enviar payload correto ao cadastrar novo drone via POST', () => {
    const novoDrone: Partial<Drone> = {
      nome: 'Drone Novo',
      precoOriginal: 2500,
      quantidadeDisponivel: 8
    };

    service.criar(novoDrone).subscribe(res => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne('/api/drones');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(novoDrone);
    req.flush({ success: true, data: { id: 99, ...novoDrone } });
  });
});
```

---

## 4. Teste de Guard Funcional de Rota (`authGuard`)

```typescript
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { authGuard } from './authGuard';
import { AuthService } from '../services/auth/AuthService';

describe('authGuard', () => {
  let authServiceMock: { isAuthenticated: ReturnType<typeof vi.fn>; hasRole: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated: vi.fn(),
      hasRole: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('deve bloquear acesso e redirecionar para /login quando usuário não estiver autenticado', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);

    const mockRoute = { data: {} } as unknown as ActivatedRouteSnapshot;
    const mockState = { url: '/admin/drones' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/admin/drones' } });
  });

  it('deve bloquear acesso quando a role exigida (ADMIN) não for atendida pelo usuário', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.hasRole.mockReturnValue(false);

    const mockRoute = { data: { role: 'ADMIN' } } as unknown as ActivatedRouteSnapshot;
    const mockState = { url: '/admin/usuarios' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/acesso-negado']);
  });

  it('deve autorizar acesso quando usuário estiver autenticado e possuir a role exigida', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.hasRole.mockReturnValue(true);

    const mockRoute = { data: { role: 'ADMIN' } } as unknown as ActivatedRouteSnapshot;
    const mockState = { url: '/admin/drones' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
```

---

## 5. Teste de Interceptor HTTP (`authInterceptor` - Bearer Token e 401 Redirect)

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authInterceptor } from './authInterceptor';
import { AuthService } from '../services/auth/AuthService';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: { getToken: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    authServiceMock = {
      getToken: vi.fn(),
      logout: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve anexar o cabeçalho Authorization com Bearer token quando o token existir', () => {
    authServiceMock.getToken.mockReturnValue('jwt-token-valido-123');

    httpClient.get('/api/admin/drones').subscribe();

    const req = httpMock.expectOne('/api/admin/drones');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token-valido-123');
    req.flush({});
  });

  it('ao receber status HTTP 401 (Unauthorized), deve efetuar logout e redirecionar para /login', () => {
    authServiceMock.getToken.mockReturnValue('token-expirado');

    httpClient.get('/api/admin/perfil').subscribe({
      next: () => expect.unreachable('Não deveria cair em sucesso'),
      error: () => {}
    });

    const req = httpMock.expectOne('/api/admin/perfil');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
```

---

## 6. Teste de Diálogo / Modal Angular Material (`MatDialogRef`, `MAT_DIALOG_DATA`)

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ConfirmDialogComponent } from './confirm-dialog';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let component: ConfirmDialogComponent;
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const dialogData = {
    titulo: 'Confirmar Exclusão',
    mensagem: 'Tem certeza que deseja excluir este drone?',
    textoConfirmar: 'Sim, excluir',
    textoCancelar: 'Cancelar'
  };

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('deve exibir o título e mensagem passados via MAT_DIALOG_DATA', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Confirmar Exclusão');
    expect(text).toContain('Tem certeza que deseja excluir este drone?');
  });

  it('deve fechar o diálogo passando true ao clicar em confirmar', () => {
    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="btn-confirmar"]');
    confirmBtn.click();

    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('deve fechar o diálogo passando false ao clicar em cancelar', () => {
    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="btn-cancelar"]');
    cancelBtn.click();

    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });
});
```
