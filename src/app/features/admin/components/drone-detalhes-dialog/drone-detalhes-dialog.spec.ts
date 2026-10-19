import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
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
    marca: 'Marca',
    modelo: 'Modelo',
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
});
