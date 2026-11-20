import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Camera } from '../../../../core/models/camera/Camera';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { CameraService } from '../../../../core/services/CameraService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { CameraList } from './camera-list';

describe('CameraList', () => {
  let component: CameraList;
  let fixture: ComponentFixture<CameraList>;
  let params$: BehaviorSubject<Record<string, string>>;
  let cameraServiceMock: {
    findAll: ReturnType<typeof vi.fn>;
    findByModelo: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const cameraComEstabilizacao: Camera = {
    id: 1,
    marcaId: 1,
    modeloId: 10,
    marca: { id: 1, nome: 'DJI' },
    modelo: { id: 10, nome: 'Zenmuse X7', marcaId: 1 },
    resolucao: '6K',
    zoom: 4,
    estabilizacao: true,
    fps: '60',
  };

  const cameraSemEstabilizacao: Camera = {
    id: 2,
    marcaId: 2,
    modeloId: 20,
    marca: { id: 2, nome: 'Autel' },
    modelo: { id: 20, nome: 'Evo Nano Cam', marcaId: 2 },
    resolucao: '4K',
    zoom: 2,
    estabilizacao: false,
    fps: '30',
  };

  const paginaCameras: PagedResponse<Camera> = {
    items: [cameraComEstabilizacao, cameraSemEstabilizacao],
    page: 0,
    pageSize: 10,
    totalItems: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    params$ = new BehaviorSubject<Record<string, string>>({});
    cameraServiceMock = {
      findAll: vi.fn().mockReturnValue(of(paginaCameras)),
      findByModelo: vi.fn().mockReturnValue(of(paginaCameras)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(false),
      }),
    };

    TestBed.configureTestingModule({
      imports: [CameraList],
      providers: [
        provideRouter([]),
        { provide: CameraService, useValue: cameraServiceMock },
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

    fixture = TestBed.createComponent(CameraList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('chama findAll(0, 10) inicialmente e renderiza modelo, marca, resolução, zoom e estabilização', async () => {
    await criarComponente();

    expect(cameraServiceMock.findAll).toHaveBeenCalledWith(0, 10);
    expect(component.carregando).toBe(false);
    expect(component.dataSource.data.length).toBe(2);

    const textoDom = fixture.nativeElement.textContent as string;
    expect(textoDom).toContain('Zenmuse X7');
    expect(textoDom).toContain('DJI');
    expect(textoDom).toContain('6K');
    expect(textoDom).toContain('4x');
    expect(textoDom).toContain('Sim');
    expect(textoDom).toContain('Não');
    expect(textoDom).toContain('2 câmeras');
  });

  it('exibe estado vazio quando a API retorna lista vazia', async () => {
    cameraServiceMock.findAll.mockReturnValue(
      of<PagedResponse<Camera>>({
        items: [],
        page: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      }),
    );

    await criarComponente();

    const textoDom = fixture.nativeElement.textContent as string;
    expect(textoDom).toContain('Nenhuma câmera encontrada');
    expect(textoDom).toContain('0 câmeras');
  });

  it('exibe estado de erro quando a API falha', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    cameraServiceMock.findAll.mockReturnValue(throwError(() => ({ status: 500 })));

    await criarComponente();

    expect(component.carregando).toBe(false);
    expect(component.erroCarregamento).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Não foi possível carregar as câmeras');
  });

  it('dispara findByModelo e exibe chip de filtro quando parâmetro de rota modelo está presente', async () => {
    await criarComponente();
    params$.next({ modelo: 'Zenmuse' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.filtroModelo).toBe('Zenmuse');
    expect(cameraServiceMock.findByModelo).toHaveBeenCalledWith(0, 10, 'Zenmuse');

    const chip = fixture.nativeElement.querySelector('.filtro-ativo') as HTMLElement | null;
    expect(chip).not.toBeNull();
    expect(chip?.textContent).toContain('Zenmuse');
  });

  it('navega corretamente em filtrarPorModelo, limparFiltro, novaCamera e editarCamera', async () => {
    await criarComponente();

    component.filtrarPorModelo('  Zenmuse X7  ');
    expect(router.navigate).toHaveBeenCalledWith(['/admin/cameras/filtro/modelo', 'Zenmuse X7']);

    component.filtrarPorModelo('   ');
    expect(router.navigate).toHaveBeenLastCalledWith(['/admin/cameras']);

    const inputEl = fixture.nativeElement.querySelector('#cameras-busca') as HTMLInputElement;
    inputEl.value = 'Zenmuse';
    component.limparFiltro(inputEl);
    expect(inputEl.value).toBe('');
    expect(component.filtroModelo).toBe('');
    expect(router.navigate).toHaveBeenLastCalledWith(['/admin/cameras']);

    component.novaCamera();
    expect(router.navigate).toHaveBeenLastCalledWith(['/admin/cameras/new']);

    component.editarCamera(cameraComEstabilizacao);
    expect(router.navigate).toHaveBeenLastCalledWith(['/admin/cameras', 1, 'edit']);
  });

  it('recarrega a listagem com nova página e tamanho em onPageChange', async () => {
    await criarComponente();

    const pageEvent: PageEvent = {
      pageIndex: 1,
      pageSize: 20,
      length: 30,
    };

    component.onPageChange(pageEvent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(cameraServiceMock.findAll).toHaveBeenLastCalledWith(1, 20);
  });

  it('abre diálogo de confirmação em excluirCamera e chama delete somente quando confirmado', async () => {
    await criarComponente();
    dialogMock.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.excluirCamera(cameraComEstabilizacao);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Câmera',
        mensagem: 'Tem certeza que deseja excluir a câmera "Zenmuse X7"?',
      },
    });
    expect(cameraServiceMock.delete).toHaveBeenCalledWith(1);
    expect(cameraServiceMock.findAll).toHaveBeenCalledTimes(2);
  });

  it('não chama delete em excluirCamera quando o diálogo de confirmação é cancelado', async () => {
    await criarComponente();
    dialogMock.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.excluirCamera(cameraComEstabilizacao);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledTimes(1);
    expect(cameraServiceMock.delete).not.toHaveBeenCalled();
  });
});
