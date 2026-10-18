import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlterarSenhaPage } from './alterar-senha-page';

describe('AlterarSenhaPage', () => {
  let component: AlterarSenhaPage;
  let fixture: ComponentFixture<AlterarSenhaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlterarSenhaPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AlterarSenhaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
