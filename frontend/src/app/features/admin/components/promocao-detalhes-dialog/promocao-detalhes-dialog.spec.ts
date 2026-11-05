import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { PromocaoRequest } from '../../../../core/models/promocao/PromocaoRequest';
import { PromocaoService } from '../../../../core/services/PromocaoService';
import { PromocaoDetalhesDialog } from './promocao-detalhes-dialog';

describe('PromocaoDetalhesDialog', () => {
  let component: PromocaoDetalhesDialog;
  let fixture: ComponentFixture<PromocaoDetalhesDialog>;
  const promocao: PromocaoRequest = {
    id: 1,
    nome: 'Promoção de teste',
    percentualDesconto: 15,
    dataInicio: '2026-10-01',
    dataFim: '2026-10-31',
    droneIds: [10, 11],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromocaoDetalhesDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: promocao },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        {
          provide: PromocaoService,
          useValue: { findById: () => of(promocao) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PromocaoDetalhesDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exibe os detalhes depois que a API responde', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dialog-status')).toBeNull();
    expect(el.querySelectorAll('.detail-section').length).toBeGreaterThan(0);
  });

  it('mostra o carregamento enquanto aguarda e atualiza a tela ao receber a resposta (sem Zone.js)', async () => {
    const resposta$ = new Subject<any>();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PromocaoDetalhesDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: promocao },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: PromocaoService, useValue: { findById: () => resposta$ } },
      ],
    }).compileComponents();

    const pendente = TestBed.createComponent(PromocaoDetalhesDialog);
    pendente.detectChanges();
    const el: HTMLElement = pendente.nativeElement;
    expect(el.querySelector('.dialog-status')?.textContent).toContain('Carregando informações da promoção');
    expect(el.querySelector('.detail-section')).toBeNull();

    resposta$.next(promocao);
    await pendente.whenStable();

    expect(el.querySelector('.dialog-status')).toBeNull();
    expect(el.querySelectorAll('.detail-section').length).toBeGreaterThan(0);
  });
});
