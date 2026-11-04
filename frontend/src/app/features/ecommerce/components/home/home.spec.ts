import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { Drone } from '../../../../core/models/drone/Drone';
import { DroneService } from '../../../../core/services/DroneService';
import { EcommerceCatalogSearchService } from '../../../../core/services/EcommerceCatalogSearchService';
import { Home } from './home';

function criarDrone(dados: Pick<Drone, 'id' | 'nome' | 'preco' | 'imagens'>): Drone {
  return Object.assign(new Drone(), dados);
}

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  const droneService = {
    findAllEcommerce: vi.fn().mockReturnValue(of({ items: [], totalPages: 1 })),
  };

  beforeEach(async () => {
    droneService.findAllEcommerce.mockClear();
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [{ provide: DroneService, useValue: droneService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a card for each drone in the response', () => {
    component.drones.set([criarDrone({
      id: 1,
      nome: 'Drone de teste',
      preco: 1200,
      imagens: [],
    })]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.drone-card')).toHaveLength(1);
  });

  it('renders drones when the request completes without user interaction', async () => {
    const response$ = new Subject<{ items: Drone[]; totalPages: number }>();
    droneService.findAllEcommerce.mockReturnValueOnce(response$);

    const asyncFixture = TestBed.createComponent(Home);
    asyncFixture.autoDetectChanges();
    response$.next({
      items: [criarDrone({
        id: 2,
        nome: 'Drone carregado',
        preco: 1500,
        imagens: [],
      })],
      totalPages: 1,
    });

    await asyncFixture.whenStable();
    expect(asyncFixture.nativeElement.querySelectorAll('.drone-card')).toHaveLength(1);
  });

  it('renders the filters next to the product catalog in the home', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.filters-panel')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.products-area')).not.toBeNull();
  });

  it('only requests the combined filters after clicking apply', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.filter-option') as NodeListOf<HTMLButtonElement>;
    const alcance = Array.from(buttons)
      .find((button) => button.textContent?.includes('Acima de 50m até 10km'));
    const gps = fixture.nativeElement.querySelector('.feature-option input') as HTMLInputElement | null;
    const applyButton = fixture.nativeElement.querySelector('.apply-filters') as HTMLButtonElement | null;
    expect(alcance).toBeDefined();
    expect(gps).not.toBeNull();
    expect(applyButton).not.toBeNull();

    alcance?.click();
    if (gps) {
      gps.checked = true;
      gps.dispatchEvent(new Event('change'));
    }

    expect(droneService.findAllEcommerce).toHaveBeenCalledTimes(1);
    applyButton?.click();

    expect(droneService.findAllEcommerce).toHaveBeenLastCalledWith(
      0,
      12,
      expect.objectContaining({
        alcance: ['ATE_10KM'],
        possuiGPS: true,
      }),
    );
  });

  it('searches both drone name and model and displays unique results', async () => {
    const namedDrone = criarDrone({
      id: 3,
      nome: 'Drone encontrado pelo nome',
      preco: 2000,
      imagens: [],
    });
    const modelDrone = criarDrone({
      id: 4,
      nome: 'Drone encontrado pelo modelo',
      preco: 2500,
      imagens: [],
    });
    droneService.findAllEcommerce
      .mockReturnValueOnce(of({ items: [namedDrone], totalPages: 1 }))
      .mockReturnValueOnce(of({ items: [modelDrone], totalPages: 1 }));

    TestBed.inject(EcommerceCatalogSearchService).search('Mavic');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(droneService.findAllEcommerce).toHaveBeenNthCalledWith(
      2,
      0,
      12,
      expect.objectContaining({ nome: 'Mavic' }),
    );
    expect(droneService.findAllEcommerce).toHaveBeenNthCalledWith(
      3,
      0,
      12,
      expect.objectContaining({ modelo: 'Mavic' }),
    );
    expect(fixture.nativeElement.querySelectorAll('.drone-card')).toHaveLength(2);
  });
});
