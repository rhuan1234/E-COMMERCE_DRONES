import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Fornecedor } from '../../../../core/models/fornecedor/FornecedorRequest';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { FornecedorService } from '../../../../core/services/FornecedorService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { FornecedorList } from './fornecedor-list';

describe('FornecedorList', () => {
  let component: FornecedorList;
  let fixture: ComponentFixture<FornecedorList>;
  let params$: BehaviorSubject<Record<string, string>>;
  let fornecedorServiceMock: {
    findAll: ReturnType<typeof vi.fn>;
    findByNome: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const fornecedorExemplo: Fornecedor = {
    id: 1,
    nome: 'Fly Tech Distribuidora',
    cnpj: '12.345.678/0001-90',
    telefone: '(63) 99999-8888',
    email: 'contato@flytech.com.br',
    ativo: true,
    endereco: {
      id: 10,
      cep: '77001-090',
      rua: 'Quadra 104 Sul',
      bairro: 'Plano Diretor Sul',
      cidade: {
        nome: 'Palmas',
        estado: { nome: 'TO' },
      },
    },
  };

  const paginaFornecedores: PagedResponse<Fornecedor> = {
    items: [fornecedorExemplo],
    page: 0,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    params$ = new BehaviorSubject<Record<string, string>>({});
    fornecedorServiceMock = {
      findAll: vi.fn().mockReturnValue(of(paginaFornecedores)),
      findByNome: vi.fn().mockReturnValue(of(paginaFornecedores)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(false),
      }),
    };

    TestBed.configureTestingModule({
      imports: [FornecedorList],
      providers: [
        provideRouter([]),
        { provide: FornecedorService, useValue: fornecedorServiceMock },
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

    fixture = TestBed.createComponent(FornecedorList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('chama findAll(0, 10) inicialmente e renderiza nome, cnpj, telefone e email', async () => {
    await criarComponente();

    expect(fornecedorServiceMock.findAll).toHaveBeenCalledWith(0, 10);
    expect(component.carregando).toBe(false);
    expect(component.dataSource.data).toEqual([fornecedorExemplo]);

    const textoDom = fixture.nativeElement.textContent as string;
    expect(textoDom).toContain('Fly Tech Distribuidora');
    expect(textoDom).toContain('12.345.678/0001-90');
    expect(textoDom).toContain('(63) 99999-8888');
    expect(textoDom).toContain('contato@flytech.com.br');
    expect(textoDom).toContain('1 fornecedor');
  });

  it('exibe estado vazio quando a API não retorna fornecedores', async () => {
    fornecedorServiceMock.findAll.mockReturnValue(
      of<PagedResponse<Fornecedor>>({
        items: [],
        page: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      }),
    );

    await criarComponente();

    const textoDom = fixture.nativeElement.textContent as string;
    expect(textoDom).toContain('Nenhum fornecedor encontrado');
    expect(textoDom).toContain('0 fornecedores');
  });

  it('exibe estado de erro quando a API falha ao consultar fornecedores', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fornecedorServiceMock.findAll.mockReturnValue(throwError(() => ({ status: 500 })));

    await criarComponente();

    expect(component.carregando).toBe(false);
    expect(component.erroCarregamento).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Não foi possível carregar os fornecedores');
  });

  it('dispara findByNome e exibe chip de filtro quando parâmetro de rota nome está definido', async () => {
    await criarComponente();
    params$.next({ nome: 'Fly Tech' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.filtroNome).toBe('Fly Tech');
    expect(fornecedorServiceMock.findByNome).toHaveBeenCalledWith(0, 10, 'Fly Tech');

    const chip = fixture.nativeElement.querySelector('.filtro-ativo') as HTMLElement | null;
    expect(chip).not.toBeNull();
    expect(chip?.textContent).toContain('Fly Tech');
  });

  it('navega em filtrarPorNome e limpa filtro e input em limparFiltro', async () => {
    await criarComponente();

    component.filtrarPorNome('  Fly Tech  ');
    expect(router.navigate).toHaveBeenCalledWith(['/admin/fornecedores/filtro/nome', 'Fly Tech']);

    component.filtrarPorNome('   ');
    expect(router.navigate).toHaveBeenLastCalledWith(['/admin/fornecedores']);

    const inputEl = fixture.nativeElement.querySelector('#fornecedores-busca') as HTMLInputElement;
    inputEl.value = 'Fly Tech';
    component.limparFiltro(inputEl);

    expect(inputEl.value).toBe('');
    expect(component.filtroNome).toBe('');
    expect(router.navigate).toHaveBeenLastCalledWith(['/admin/fornecedores']);
  });

  it('recarrega a listagem ao alterar página em onPageChange', async () => {
    await criarComponente();

    const pageEvent: PageEvent = {
      pageIndex: 1,
      pageSize: 20,
      length: 40,
    };

    component.onPageChange(pageEvent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fornecedorServiceMock.findAll).toHaveBeenLastCalledWith(1, 20);
  });

  it('abre diálogo de confirmação em excluirFornecedor, chama delete e recarrega quando confirmado', async () => {
    await criarComponente();
    dialogMock.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.excluirFornecedor(fornecedorExemplo);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Fornecedor',
        mensagem: 'Deseja realmente excluir o fornecedor "Fly Tech Distribuidora"?',
      },
    });
    expect(fornecedorServiceMock.delete).toHaveBeenCalledWith(1);
    expect(fornecedorServiceMock.findAll).toHaveBeenCalledTimes(2);
  });

  it('não chama delete em excluirFornecedor quando o diálogo de confirmação é cancelado', async () => {
    await criarComponente();
    dialogMock.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.excluirFornecedor(fornecedorExemplo);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledTimes(1);
    expect(fornecedorServiceMock.delete).not.toHaveBeenCalled();
  });
});
