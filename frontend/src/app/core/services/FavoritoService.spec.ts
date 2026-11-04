import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FavoritoService } from './FavoritoService';

describe('FavoritoService', () => {
  let service: FavoritoService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FavoritoService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('lists favorites using the paginated endpoint', () => {
    service.listar(2, 12).subscribe();

    const request = httpTestingController.expectOne(
      (req) => req.url === 'http://localhost:8080/favoritos/listar',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('12');
    request.flush({ items: [], page: 2, pageSize: 12, totalItems: 0, totalPages: 0 });
  });

  it('adds and removes a drone through the authenticated favorite endpoints', () => {
    service.adicionar(41).subscribe();
    const addRequest = httpTestingController.expectOne('http://localhost:8080/favoritos/41');
    expect(addRequest.request.method).toBe('POST');
    expect(addRequest.request.body).toBeNull();
    addRequest.flush('Drone favoritado com sucesso');

    service.remover(41).subscribe();
    const removeRequest = httpTestingController.expectOne('http://localhost:8080/favoritos/41');
    expect(removeRequest.request.method).toBe('DELETE');
    removeRequest.flush('Drone removido dos favoritos com sucesso');
  });
});
