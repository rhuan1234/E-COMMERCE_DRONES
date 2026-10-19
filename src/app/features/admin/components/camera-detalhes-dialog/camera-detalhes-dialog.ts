import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Camera } from '../../../../core/models/camera/Camera';
import { CameraService } from '../../../../core/services/CameraService';

type CameraDetalhada = Camera & {
  marca?: { id?: number; nome?: string };
};

@Component({
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  selector: 'app-camera-detalhes-dialog',
  styleUrl: './camera-detalhes-dialog.css',
  templateUrl: './camera-detalhes-dialog.html',
})
export class CameraDetalhesDialog implements OnInit {
  camera: CameraDetalhada;
  carregando = true;
  erro = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) camera: Camera,
    private readonly cameraService: CameraService,
    private readonly dialogRef: MatDialogRef<CameraDetalhesDialog>
  ) {
    this.camera = camera;
  }

  ngOnInit(): void {
    this.cameraService.findById(this.camera.id).subscribe({
      next: (camera) => {
        this.camera = camera;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes da câmera:', error);
        this.erro = 'Não foi possível carregar os detalhes da câmera.';
        this.carregando = false;
      },
    });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
