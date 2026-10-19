import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Marca } from '../../../../core/models/marca/Marca';
import { MarcaService } from '../../../../core/services/MarcaService';

@Component({
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  selector: 'app-marca-detalhes-dialog',
  styleUrl: './marca-detalhes-dialog.css',
  templateUrl: './marca-detalhes-dialog.html',
})
export class MarcaDetalhesDialog implements OnInit {
  marca: Marca;
  carregando = true;
  erro = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) marca: Marca,
    private readonly marcaService: MarcaService,
    private readonly dialogRef: MatDialogRef<MarcaDetalhesDialog>
  ) {
    this.marca = marca;
  }

  ngOnInit(): void {
    this.marcaService.findById(this.marca.id).subscribe({
      next: (marca) => {
        this.marca = marca;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes da marca:', error);
        this.erro = 'Não foi possível carregar os detalhes da marca.';
        this.carregando = false;
      },
    });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
