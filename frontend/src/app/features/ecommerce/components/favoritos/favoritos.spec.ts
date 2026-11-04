import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { Drone } from '../../../../core/models/drone/Drone';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { DroneService } from '../../../../core/services/DroneService';
import { FavoritoService } from '../../../../core/services/FavoritoService';
import { Favoritos } from './favoritos';

describe('Favoritos', () => {
  let fixture: ComponentFixture<Favoritos>;
  let component: Favoritos;
  const drone = Object.assign(new Drone(), {
    id: 31,
    nome: 'Drone salvo',
    preco: 2750,
    imagens: [],
  });
  const page = {
    items: [drone],
    page: 0,
    pageSize: 12,
    totalItems: 1,
    totalPages: 1,
  };
  const favoritoService = {
    listar: vi.fn().mockReturnValue(of(page)),
    remover: vi.fn().mockReturnValue(of('ok')),
  };
  const droneService = { obterUrlImagem: vi.fn() };
  const authService = { isAuthenticated: vi.fn().mockReturnValue(true) };
  let router: Router;

  beforeEach(async () => {
    favoritoService.listar.mockClear();
    favoritoService.remover.mockClear();
    authService.isAuthenticated.mockReturnValue(true);
    await TestBed.configureTestingModule({
      imports: [Favoritos],
      providers: [
        provideRouter([]),
        { provide: FavoritoService, useValue: favoritoService },
        { provide: DroneService, useValue: droneService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockClear();
    fixture = TestBed.createComponent(Favoritos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads and renders the authenticated user favorites', () => {
    expect(favoritoService.listar).toHaveBeenCalledWith(0, 12);
    expect(fixture.nativeElement.textContent).toContain('Drone salvo');
  });

  it('removes a favorite and refreshes the current page', () => {
    const removeButton = fixture.nativeElement.querySelector('.favorite-details button') as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(favoritoService.remover).toHaveBeenCalledWith(31);
    expect(favoritoService.listar).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).toContain('foi removido dos favoritos');
  });

  it('redirects unauthenticated users to login instead of requesting favorites', () => {
    authService.isAuthenticated.mockReturnValue(false);
    const unauthenticatedFixture = TestBed.createComponent(Favoritos);
    unauthenticatedFixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(
      ['/login'],
      { queryParams: { returnUrl: '/favoritos' } },
    );
    expect(favoritoService.listar).toHaveBeenCalledTimes(1);
  });
});
