import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
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
});
