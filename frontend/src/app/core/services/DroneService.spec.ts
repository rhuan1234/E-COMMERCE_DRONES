import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DroneService } from './DroneService';

describe('DroneService', () => {
  let service: DroneService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DroneService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('sends repeated catalog filters and combines them with price and feature filters', () => {
    service.findAllEcommerce(0, 12, {
      min: 1000,
      max: 5000,
      alcance: ['ATE_10KM', 'ACIMA_50KM'],
      autonomia: ['DE_20_A_40_MIN'],
      camera: ['FULL_HD', 'ESTABILIZACAO'],
      possuiGPS: true,
      comControleRemoto: true,
      controladoPorAplicativo: false,
    }).subscribe();

    const request = httpTestingController.expectOne((req) => req.url === 'http://localhost:8080/drones');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.getAll('alcance')).toEqual(['ATE_10KM', 'ACIMA_50KM']);
    expect(request.request.params.getAll('autonomia')).toEqual(['DE_20_A_40_MIN']);
    expect(request.request.params.getAll('camera')).toEqual(['FULL_HD', 'ESTABILIZACAO']);
    expect(request.request.params.get('min')).toBe('1000');
    expect(request.request.params.get('max')).toBe('5000');
    expect(request.request.params.get('possuiGPS')).toBe('true');
    expect(request.request.params.get('comControleRemoto')).toBe('true');
    expect(request.request.params.get('controladoPorAplicativo')).toBe('false');

    request.flush({ items: [], page: 0, pageSize: 12, totalItems: 0, totalPages: 0 });
  });

  it('sends name or model search terms to the matching API query parameter', () => {
    service.findAllEcommerce(0, 12, { nome: 'Mavic' }).subscribe();
    const nameRequest = httpTestingController.expectOne((req) => req.url === 'http://localhost:8080/drones');
    expect(nameRequest.request.params.get('nome')).toBe('Mavic');
    expect(nameRequest.request.params.has('modelo')).toBe(false);
    nameRequest.flush({ items: [], page: 0, pageSize: 12, totalItems: 0, totalPages: 0 });

    service.findAllEcommerce(0, 12, { modelo: 'Mavic' }).subscribe();
    const modelRequest = httpTestingController.expectOne((req) => req.url === 'http://localhost:8080/drones');
    expect(modelRequest.request.params.get('modelo')).toBe('Mavic');
    expect(modelRequest.request.params.has('nome')).toBe(false);
    modelRequest.flush({ items: [], page: 0, pageSize: 12, totalItems: 0, totalPages: 0 });
  });

  it('loads one drone from the public ecommerce detail endpoint', () => {
    service.findByIdEcommerce(17).subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/drones/17');
    expect(request.request.method).toBe('GET');
    request.flush({ id: 17, nome: 'Drone de detalhes', imagens: [] });
  });
});
