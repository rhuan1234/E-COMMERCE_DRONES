import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministradorForm } from './administrador-form';

describe('AdministradorForm', () => {
  let component: AdministradorForm;
  let fixture: ComponentFixture<AdministradorForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministradorForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministradorForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
