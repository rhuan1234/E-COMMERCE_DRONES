import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Drone } from '../../../../core/models/drone/Drone';
import { DroneService } from '../../../../core/services/DroneService';

type DroneDetalhado = Drone & {
  camera?: { modelo?: string; resolucao?: string };
  fornecedor?: { nome?: string };
};

@Component({
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  selector: 'app-drone-detalhes-dialog',
  styleUrl: './drone-detalhes-dialog.css',
  templateUrl: './drone-detalhes-dialog.html',
})
export class DroneDetalhesDialog implements OnInit {
  drone: DroneDetalhado;
  carregando = true;
  erro = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) drone: Drone,
    private readonly droneService: DroneService,
    private readonly dialogRef: MatDialogRef<DroneDetalhesDialog>
  ) {
    this.drone = drone;
  }

  ngOnInit(): void {
    this.droneService.findById(this.drone.id).subscribe({
      next: (drone) => {
        this.drone = drone;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes do drone:', error);
        this.erro = 'Não foi possível carregar os detalhes do drone.';
        this.carregando = false;
      },
    });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
