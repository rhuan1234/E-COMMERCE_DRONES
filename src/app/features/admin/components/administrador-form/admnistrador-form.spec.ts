import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdmnistradorForm } from './admnistrador-form';

describe('AdmnistradorForm', () => {
  let component: AdmnistradorForm;
  let fixture: ComponentFixture<AdmnistradorForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmnistradorForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AdmnistradorForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
