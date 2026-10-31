import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Fornecedor } from '../../../../core/models/fornecedor/FornecedorRequest';
import { FornecedorService } from '../../../../core/services/FornecedorService';
import { FornecedorDetalhesDialog } from './fornecedor-detalhes-dialog';

describe('FornecedorDetalhesDialog', () => {
  let component: FornecedorDetalhesDialog;
  let fixture: ComponentFixture<FornecedorDetalhesDialog>;
  const fornecedor: Fornecedor = {
    id: 1,
    nome: 'Fornecedor Exemplo',
    cnpj: '12.345.678/0001-90',
    email: 'contato@exemplo.com',
    telefone: '(11) 1234-5678',
    ativo: true,
    endereco: {
      id: 1,
      rua: 'Rua Exemplo',
      bairro: 'Centro',
      cep: '01000-000',
      cidade: {
        nome: 'São Paulo',
        estado: { nome: 'SP' },
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FornecedorDetalhesDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: fornecedor },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        {
          provide: FornecedorService,
          useValue: { findById: () => of(fornecedor) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FornecedorDetalhesDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
