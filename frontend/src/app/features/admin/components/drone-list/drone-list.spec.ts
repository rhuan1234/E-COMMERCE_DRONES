import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Drone } from '../../../../core/models/drone/Drone';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { DroneService } from '../../../../core/services/DroneService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { DroneList } from './drone-list';

describe('DroneList', () => {
  let component: DroneList;
  let fixture: ComponentFixture<DroneList>;
  let queryParams$: BehaviorSubject<Record<string, string>>;
  let droneServiceSpy: {
    findAll: ReturnType<typeof vi.fn>;
    findByModelo: ReturnType<typeof vi.fn>;
    findByMarca: ReturnType<typeof vi.fn>;
    findByNome: ReturnType<typeof vi.fn>;
    findByPreco: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const droneExemplo: Drone = {
    id: 1,
    nome: 'Drone DJI Air 3',
    marca: { id: 1, nome: 'DJI' },
    modelo: { id: 10, nome: 'Air 3', marcaId: 1 },
    preco: 4500,
    quantidadeDisponivel: 5,
    ativa: true,
    tempoVooPratico: 46,
    pesoDecolagem: 720,
    altitudeMaxima: 6000,
    velocidadeMaxima: 75,
    alcanceTransmissao: 20000,
    possuiCamera: true,
    quantidadeMotores: 4,
    comControleRemoto: true,
    controladoPorAplicativo: true,
    quantidadeBaterias: 2,
    duracaoBateria: '46 min',
    frequenciaWifi: '5.8 GHz',
    possuiGPS: true,
    cameraId: 1,
    fornecedorId: 1,
  };

  const mockPagedResponse: PagedResponse<Drone> = {
    items: [droneExemplo],
    page: 0,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    queryParams$ = new BehaviorSubject<Record<string, string>>({});
    droneServiceSpy = {
      findAll: vi.fn().mockReturnValue(of(mockPagedResponse)),
      findByModelo: vi.fn().mockReturnValue(of(mockPagedResponse)),
      findByMarca: vi.fn().mockReturnValue(of(mockPagedResponse)),
      findByNome: vi.fn().mockReturnValue(of(mockPagedResponse)),
      findByPreco: vi.fn().mockReturnValue(of(mockPagedResponse)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(false),
      }),
    };
    snackBarMock = {
      open: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [DroneList],
      providers: [
        provideRouter([]),
        { provide: DroneService, useValue: droneServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParams$.asObservable(),
          },
        },
      ],
    })
      .overrideProvider(MatDialog, { useValue: dialogMock })
      .overrideProvider(MatSnackBar, { useValue: snackBarMock });

    await TestBed.compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(DroneList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create and load all drones when no query params are present', () => {
    expect(droneServiceSpy.findAll).toHaveBeenCalledWith(0, 10, {
      nome: '',
      marca: '',
      modelo: '',
      min: null,
      max: null,
    });
    expect(component.dataSource.data.length).toBe(1);
    expect(component.filtroAtivo).toBe(false);

    const textoDom = fixture.nativeElement.textContent as string;
    expect(textoDom).toContain('Drone DJI Air 3');
    expect(textoDom).toContain('1 drone');
  });

  it('should apply multiple simultaneous filters from queryParams', async () => {
    queryParams$.next({ nome: 'Air', marca: 'DJI', modelo: 'Mavic', min: '1000', max: '5000' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.filtroNome).toBe('Air');
    expect(component.filtroMarca).toBe('DJI');
    expect(component.filtroModelo).toBe('Mavic');
    expect(component.precoMin).toBe(1000);
    expect(component.precoMax).toBe(5000);
    expect(component.filtroAtivo).toBe(true);
    expect(droneServiceSpy.findAll).toHaveBeenLastCalledWith(0, 10, {
      nome: 'Air',
      marca: 'DJI',
      modelo: 'Mavic',
      min: 1000,
      max: 5000,
    });
  });

  it('should navigate with only filled filter fields in queryParams and close popup', () => {
    component.menuFiltrosAberto = true;
    component.filtroMarca = 'DJI';
    component.filtroModelo = 'Air 3';
    component.precoMax = 6000;
    component.aplicarFiltro();
    expect(component.menuFiltrosAberto).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/drones'], {
      queryParams: {
        marca: 'DJI',
        modelo: 'Air 3',
        max: 6000,
      },
    });
  });

  it('should remove an individual filter chip and re-navigate', async () => {
    queryParams$.next({ marca: 'DJI', modelo: 'Mavic' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.quantidadeFiltrosAtivos).toBe(2);
    component.removerFiltroIndividual('marca');
    expect(router.navigate).toHaveBeenLastCalledWith(['/admin/drones'], {
      queryParams: {
        modelo: 'Mavic',
      },
    });
  });

  it('should toggle and close filter popup on Escape key', () => {
    expect(component.menuFiltrosAberto).toBe(false);
    component.toggleMenuFiltros();
    expect(component.menuFiltrosAberto).toBe(true);
    component.onEscapeKey();
    expect(component.menuFiltrosAberto).toBe(false);
  });

  it('should not navigate when price range has min > max', () => {
    component.precoMin = 5000;
    component.precoMax = 1000;
    component.aplicarFiltro();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'O preço mínimo não pode ser maior que o preço máximo.',
      'Fechar',
      { duration: 3500 },
    );
  });

  it('should clear dataSource when backend returns 400 (no results found)', async () => {
    droneServiceSpy.findAll.mockReturnValue(throwError(() => ({ status: 400 })));
    queryParams$.next({ modelo: 'Inexistente' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.dataSource.data).toEqual([]);
    expect(component.totalItems).toBe(0);
    expect(component.erroCarregamento).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Nenhum drone encontrado');
  });

  it('exibe estado de erro HTTP 500 quando o carregamento de drones falha', async () => {
    droneServiceSpy.findAll.mockReturnValue(throwError(() => ({ status: 500 })));

    component.carregarDrones();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.carregando).toBe(false);
    expect(component.erroCarregamento).toBe(true);
    expect(component.dataSource.data).toEqual([]);
    expect(snackBarMock.open).toHaveBeenCalledWith('Erro ao consultar drones. Tente novamente.', 'Fechar', {
      duration: 3500,
    });
    expect(fixture.nativeElement.textContent).toContain('Não foi possível carregar os drones');
  });

  it('abre diálogo de confirmação em excluirDrone, exclui e recarrega quando confirmado', async () => {
    dialogMock.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    component.excluirDrone(droneExemplo);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Drone',
        mensagem: 'Deseja realmente excluir o drone "Drone DJI Air 3"?',
      },
    });
    expect(droneServiceSpy.delete).toHaveBeenCalledWith(1);
    expect(droneServiceSpy.findAll).toHaveBeenCalledTimes(2);
  });

  it('não chama delete em excluirDrone quando o diálogo de confirmação é cancelado', async () => {
    dialogMock.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    component.excluirDrone(droneExemplo);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledTimes(1);
    expect(droneServiceSpy.delete).not.toHaveBeenCalled();
  });
});
