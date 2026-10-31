import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DroneList } from './drone-list';
import { DroneService } from '../../../../core/services/DroneService';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DroneList', () => {
  let component: DroneList;
  let fixture: ComponentFixture<DroneList>;
  let queryParams$: BehaviorSubject<Record<string, any>>;
  let droneServiceSpy: {
    findAll: ReturnType<typeof vi.fn>;
    findByModelo: ReturnType<typeof vi.fn>;
    findByMarca: ReturnType<typeof vi.fn>;
    findByNome: ReturnType<typeof vi.fn>;
    findByPreco: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  const mockPagedResponse = {
    items: [
      {
        id: 1,
        nome: 'Drone DJI Air 3',
        marca: 'DJI',
        modelo: 'Air 3',
        preco: 4500,
        quantidadeDisponivel: 5,
        ativa: true,
        possuiGPS: true,
      } as any,
    ],
    page: 0,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    queryParams$ = new BehaviorSubject<Record<string, any>>({});
    droneServiceSpy = {
      findAll: vi.fn().mockReturnValue(of(mockPagedResponse)),
      findByModelo: vi.fn().mockReturnValue(of(mockPagedResponse)),
      findByMarca: vi.fn().mockReturnValue(of(mockPagedResponse)),
      findByNome: vi.fn().mockReturnValue(of(mockPagedResponse)),
      findByPreco: vi.fn().mockReturnValue(of(mockPagedResponse)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [DroneList, NoopAnimationsModule],
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
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(DroneList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load all drones when no query params are present', () => {
    expect(component).toBeTruthy();
    expect(droneServiceSpy.findAll).toHaveBeenCalledWith(0, 10, {
      nome: '',
      marca: '',
      modelo: '',
      min: null,
      max: null,
    });
    expect(component.dataSource.data.length).toBe(1);
    expect(component.filtroAtivo).toBe(false);
  });

  it('should apply multiple simultaneous filters from queryParams', () => {
    queryParams$.next({ nome: 'Air', marca: 'DJI', modelo: 'Mavic', min: '1000', max: '5000' });
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
    expect(router.navigate).toHaveBeenCalledWith(['/drones'], {
      queryParams: {
        marca: 'DJI',
        modelo: 'Air 3',
        max: 6000,
      },
    });
  });

  it('should remove an individual filter chip and re-navigate', () => {
    queryParams$.next({ marca: 'DJI', modelo: 'Mavic' });
    expect(component.quantidadeFiltrosAtivos).toBe(2);
    component.removerFiltroIndividual('marca');
    expect(router.navigate).toHaveBeenLastCalledWith(['/drones'], {
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
  });

  it('should clear dataSource when backend returns 400 (no results found)', () => {
    droneServiceSpy.findAll.mockReturnValue(throwError(() => ({ status: 400 })));
    queryParams$.next({ modelo: 'Inexistente' });
    expect(component.dataSource.data).toEqual([]);
    expect(component.totalItems).toBe(0);
  });
});
