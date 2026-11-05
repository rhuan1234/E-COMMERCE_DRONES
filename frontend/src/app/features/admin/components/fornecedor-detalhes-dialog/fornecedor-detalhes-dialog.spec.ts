import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
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
      imports: [FornecedorDetalhesDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: fornecedor },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: FornecedorService, useValue: { findById: () => resposta$ } },
      ],
    }).compileComponents();

    const pendente = TestBed.createComponent(FornecedorDetalhesDialog);
    pendente.detectChanges();
    const el: HTMLElement = pendente.nativeElement;
    expect(el.querySelector('.dialog-status')?.textContent).toContain('Carregando informações do fornecedor');
    expect(el.querySelector('.detail-section')).toBeNull();

    resposta$.next(fornecedor);
    await pendente.whenStable();

    expect(el.querySelector('.dialog-status')).toBeNull();
    expect(el.querySelectorAll('.detail-section').length).toBeGreaterThan(0);
  });
});
