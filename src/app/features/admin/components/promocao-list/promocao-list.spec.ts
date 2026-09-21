import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromocaoList } from './promocao-list';

describe('PromocaoList', () => {
  let component: PromocaoList;
  let fixture: ComponentFixture<PromocaoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromocaoList],
    }).compileComponents();

    fixture = TestBed.createComponent(PromocaoList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
