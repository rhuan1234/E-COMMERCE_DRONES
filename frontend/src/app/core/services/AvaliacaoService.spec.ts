import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AvaliacaoService } from './AvaliacaoService';

describe('AvaliacaoService', () => {
  let service: AvaliacaoService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AvaliacaoService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('requests one page of five reviews for a drone', () => {
    service.listarPorDrone(17, 1).subscribe();

    const request = httpTestingController.expectOne(
      'http://localhost:8080/avaliacoes/drone/17?page=1&pageSize=5',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ items: [], page: 1, pageSize: 5, totalItems: 6, totalPages: 2 });
  });

  it('posts the rating and comment linked directly to the drone', () => {
    const dados = { nota: 4, comentario: 'Bom drone', droneId: 17 };
    service.criar(dados).subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/avaliacoes');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(dados);
    request.flush({
      id: 1,
      ...dados,
      nomeCliente: 'Lucas Silva',
      dataAvaliacao: '2026-11-09T12:00:00',
      usuarioId: 2,
    });
  });
});
