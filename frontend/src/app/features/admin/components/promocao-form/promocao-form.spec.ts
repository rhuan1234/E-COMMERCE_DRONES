import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromocaoForm } from './promocao-form';

describe('PromocaoForm', () => {
  let component: PromocaoForm;
  let fixture: ComponentFixture<PromocaoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromocaoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PromocaoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
