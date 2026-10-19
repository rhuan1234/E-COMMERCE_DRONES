import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Camera } from '../../../../core/models/camera/Camera';
import { CameraService } from '../../../../core/services/CameraService';
import { CameraDetalhesDialog } from './camera-detalhes-dialog';

describe('CameraDetalhesDialog', () => {
  let component: CameraDetalhesDialog;
  let fixture: ComponentFixture<CameraDetalhesDialog>;
  const camera: Camera = {
    id: 1,
    modelo: 'Câmera teste',
    marca: { id: 2, nome: 'Marca teste' },
    resolucao: '4K',
    zoom: 3,
    estabilizacao: true,
    fps: '60',
  };
  const cameraService = { findById: vi.fn() };
  const dialogRef = { close: vi.fn() };

  beforeEach(async () => {
    cameraService.findById.mockReturnValue(of(camera));
    dialogRef.close.mockReset();

    await TestBed.configureTestingModule({
      imports: [CameraDetalhesDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: camera },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: CameraService, useValue: cameraService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraDetalhesDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows camera details after loading', () => {
    expect(fixture.nativeElement.textContent).toContain('Câmera teste');
    expect(fixture.nativeElement.textContent).toContain('Marca teste');
    expect(fixture.nativeElement.textContent).toContain('4K');
    expect(fixture.nativeElement.textContent).toContain('3x');
    expect(fixture.nativeElement.textContent).toContain('60');
  });

  it('closes the dialog', () => {
    component.fechar();

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('shows an error when camera details cannot be loaded', async () => {
    cameraService.findById.mockReturnValue(throwError(() => new Error('Request failed')));
    const errorFixture = TestBed.createComponent(CameraDetalhesDialog);
    errorFixture.detectChanges();
    await errorFixture.whenStable();

    expect(errorFixture.nativeElement.textContent).toContain(
      'Não foi possível carregar os detalhes da câmera.'
    );
  });
});
