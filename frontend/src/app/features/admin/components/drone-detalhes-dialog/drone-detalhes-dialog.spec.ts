import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';
import { Drone } from '../../../../core/models/drone/Drone';
import { DroneService } from '../../../../core/services/DroneService';
import { DroneDetalhesDialog } from './drone-detalhes-dialog';

describe('DroneDetalhesDialog', () => {
  let component: DroneDetalhesDialog;
  let fixture: ComponentFixture<DroneDetalhesDialog>;
  const drone: Drone = {
    id: 1,
    nome: 'Drone teste',
    marca: { id: 1, nome: 'Marca' },
    modelo: { id: 1, nome: 'Modelo', marcaId: 1 },
    preco: 100,
    quantidadeDisponivel: 2,
    ativa: true,
    tempoVooPratico: 30,
    pesoDecolagem: 500,
    altitudeMaxima: 120,
    velocidadeMaxima: 50,
    alcanceTransmissao: 1000,
    possuiCamera: true,
    quantidadeMotores: 4,
    comControleRemoto: true,
    controladoPorAplicativo: true,
    quantidadeBaterias: 2,
    duracaoBateria: '30 minutos',
    frequenciaWifi: '2.4 GHz',
    possuiGPS: true,
    cameraId: 1,
    fornecedorId: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneDetalhesDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: drone },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: DroneService, useValue: { findById: vi.fn(() => of(drone)) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DroneDetalhesDialog);
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
      imports: [DroneDetalhesDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: drone },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: DroneService, useValue: { findById: () => resposta$ } },
      ],
    }).compileComponents();

    const pendente = TestBed.createComponent(DroneDetalhesDialog);
    pendente.detectChanges();
    const el: HTMLElement = pendente.nativeElement;
    expect(el.querySelector('.dialog-status')?.textContent).toContain('Carregando informações do drone');
    expect(el.querySelector('.detail-section')).toBeNull();

    resposta$.next(drone);
    await pendente.whenStable();

    expect(el.querySelector('.dialog-status')).toBeNull();
    expect(el.querySelectorAll('.detail-section').length).toBeGreaterThan(0);
  });
});
