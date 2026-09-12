import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FornecedorList } from './fornecedor-list';

describe('FornecedorList', () => {
  let component: FornecedorList;
  let fixture: ComponentFixture<FornecedorList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FornecedorList],
    }).compileComponents();

    fixture = TestBed.createComponent(FornecedorList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
