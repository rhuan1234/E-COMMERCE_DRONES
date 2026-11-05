import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Modelo } from '../../../../core/models/modelo/Modelo';
import { ModeloService } from '../../../../core/services/ModeloService';

@Component({
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  selector: 'app-modelo-detalhes-dialog',
  styleUrl: './modelo-detalhes-dialog.css',
  templateUrl: './modelo-detalhes-dialog.html',
})
export class ModeloDetalhesDialog implements OnInit {
  /** O app roda sem Zone.js: avisa o Angular quando uma resposta assíncrona muda o estado. */
  private readonly cdr = inject(ChangeDetectorRef);

  modelo: Modelo;
  carregando = true;
  erro = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) modelo: Modelo,
    private readonly modeloService: ModeloService,
    private readonly dialogRef: MatDialogRef<ModeloDetalhesDialog>
  ) {
    this.modelo = modelo;
  }

  ngOnInit(): void {
    this.modeloService.findById(this.modelo.id).subscribe({
      next: (modelo) => {
        this.modelo = modelo;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes do modelo:', error);
        this.erro = 'Não foi possível carregar os detalhes do modelo.';
        this.carregando = false;
        this.cdr.markForCheck();
      },
    });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
