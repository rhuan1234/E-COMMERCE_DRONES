import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DroneForm } from './drone-form';

describe('DroneForm', () => {
  let component: DroneForm;
  let fixture: ComponentFixture<DroneForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneForm],
    }).compileComponents();

    fixture = TestBed.createComponent(DroneForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
