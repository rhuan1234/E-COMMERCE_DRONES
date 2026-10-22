import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Drone } from '../../../../core/models/drone/Drone';
import { DroneService } from '../../../../core/services/DroneService';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  const droneService = {
    findAllEcommerce: vi.fn().mockReturnValue(of({ items: [], totalPages: 1 })),
  };

  beforeEach(async () => {
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
    component.drones = [
      {
        id: 1,
        nome: 'Drone de teste',
        preco: 1200,
        imagens: [],
      } as Drone,
    ];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.drone-card')).toHaveLength(1);
  });

  it('renders the filters next to the product catalog in the home', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.filters-panel')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.products-area')).not.toBeNull();
  });
});
