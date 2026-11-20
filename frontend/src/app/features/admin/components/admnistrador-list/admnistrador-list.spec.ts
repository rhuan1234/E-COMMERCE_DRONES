import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Administrador } from '../../../../core/models/administrador/Administrado';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { AdministradorService } from '../../../../core/services/AdministradorService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { AdmnistradorList } from './admnistrador-list';

describe('AdmnistradorList', () => {
  let component: AdmnistradorList;
  let fixture: ComponentFixture<AdmnistradorList>;
  let params$: BehaviorSubject<Record<string, string>>;
  let administradorServiceMock: {
    findAll: ReturnType<typeof vi.fn>;
    findByLogin: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const adminExemplo: Administrador = {
    id: 1,
    login: 'rhuan',
    email: 'rhuan@skyline.com',
    perfil: 'ADMIN',
  };

  const paginaAdmins: PagedResponse<Administrador> = {
    items: [adminExemplo],
    page: 0,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    params$ = new BehaviorSubject<Record<string, string>>({});
    administradorServiceMock = {
      findAll: vi.fn().mockReturnValue(of(paginaAdmins)),
      findByLogin: vi.fn().mockReturnValue(of(paginaAdmins)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(false),
      }),
    };

    TestBed.configureTestingModule({
      imports: [AdmnistradorList],
      providers: [
        provideRouter([]),
        { provide: AdministradorService, useValue: administradorServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: params$.asObservable(),
          },
        },
      ],
    }).overrideProvider(MatDialog, { useValue: dialogMock });

    await TestBed.compileComponents();
  });

  async function criarComponente(): Promise<void> {
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(AdmnistradorList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('chama findAll(0, 10) inicialmente e renderiza as linhas e o contador', async () => {
    await criarComponente();

    expect(administradorServiceMock.findAll).toHaveBeenCalledWith(0, 10);
    expect(component.carregando).toBe(false);
    expect(component.dataSource.data).toEqual([adminExemplo]);

    const textoDom = fixture.nativeElement.textContent as string;
    expect(textoDom).toContain('rhuan');
    expect(textoDom).toContain('rhuan@skyline.com');
    expect(textoDom).toContain('1 administrador');
  });

  it('exibe estado vazio quando a API retorna lista sem itens', async () => {
    administradorServiceMock.findAll.mockReturnValue(
      of<PagedResponse<Administrador>>({
        items: [],
        page: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      }),
    );

    await criarComponente();

    const textoDom = fixture.nativeElement.textContent as string;
    expect(textoDom).toContain('Nenhum administrador encontrado');
    expect(textoDom).toContain('0 administradores');
  });

  it('exibe estado de erro quando a API falha ao carregar administradores', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    administradorServiceMock.findAll.mockReturnValue(throwError(() => ({ status: 500 })));

    await criarComponente();

    expect(component.carregando).toBe(false);
    expect(component.erroCarregamento).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Não foi possível carregar os administradores');
  });

  it('dispara findByLogin e exibe chip de filtro ativo quando parâmetro de rota login é informado', async () => {
    await criarComponente();
    params$.next({ login: 'rhuan' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.filtroLogin).toBe('rhuan');
    expect(administradorServiceMock.findByLogin).toHaveBeenCalledWith(0, 10, 'rhuan');

    const chip = fixture.nativeElement.querySelector('.filtro-ativo') as HTMLElement | null;
    expect(chip).not.toBeNull();
    expect(chip?.textContent).toContain('rhuan');
  });

  it('navega para rota de filtro em filtrarPorLogin e retorna à lista base em limparFiltro', async () => {
    await criarComponente();

    component.filtrarPorLogin('  admin.master  ');
    expect(router.navigate).toHaveBeenCalledWith(['/admin/administradores/filtro/login', 'admin.master']);

    component.filtrarPorLogin('   ');
    expect(router.navigate).toHaveBeenLastCalledWith(['/admin/administradores']);

    const inputEl = fixture.nativeElement.querySelector('#administradores-busca') as HTMLInputElement;
    inputEl.value = 'rhuan';
    component.limparFiltro(inputEl);

    expect(inputEl.value).toBe('');
    expect(component.filtroLogin).toBe('');
    expect(router.navigate).toHaveBeenLastCalledWith(['/admin/administradores']);
  });

  it('recarrega a página selecionada em onPageChange', async () => {
    await criarComponente();

    const pageEvent: PageEvent = {
      pageIndex: 2,
      pageSize: 20,
      length: 50,
    };

    component.onPageChange(pageEvent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administradorServiceMock.findAll).toHaveBeenLastCalledWith(2, 20);
  });

  it('confirma exclusão no diálogo e chama delete recarregando a lista', async () => {
    await criarComponente();
    dialogMock.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.excluirAdministrador(adminExemplo);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Administrador',
        mensagem: 'Deseja realmente excluir o administrador "rhuan"?',
      },
    });
    expect(administradorServiceMock.delete).toHaveBeenCalledWith(1);
    expect(administradorServiceMock.findAll).toHaveBeenCalledTimes(2);
  });

  it('não chama delete quando o diálogo de confirmação é cancelado', async () => {
    await criarComponente();
    dialogMock.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.excluirAdministrador(adminExemplo);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledTimes(1);
    expect(administradorServiceMock.delete).not.toHaveBeenCalled();
  });
});
