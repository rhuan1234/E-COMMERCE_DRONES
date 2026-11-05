import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Fornecedor } from '../../../../core/models/fornecedor/FornecedorRequest';
import { FornecedorService } from '../../../../core/services/FornecedorService';

@Component({
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  selector: 'app-fornecedor-detalhes-dialog',
  styleUrl: './fornecedor-detalhes-dialog.css',
  templateUrl: './fornecedor-detalhes-dialog.html',
})
export class FornecedorDetalhesDialog implements OnInit {
  /** O app roda sem Zone.js: avisa o Angular quando uma resposta assíncrona muda o estado. */
  private readonly cdr = inject(ChangeDetectorRef);

  fornecedor: Fornecedor;
  carregando = true;
  erro = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) fornecedor: Fornecedor,
    private readonly fornecedorService: FornecedorService,
    private readonly dialogRef: MatDialogRef<FornecedorDetalhesDialog>
  ) {
    this.fornecedor = fornecedor;
  }

  ngOnInit(): void {
    this.fornecedorService.findById(String(this.fornecedor.id)).subscribe({
      next: (fornecedor) => {
        this.fornecedor = fornecedor;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes do fornecedor:', error);
        this.erro = 'Não foi possível carregar os detalhes do fornecedor.';
        this.carregando = false;
        this.cdr.markForCheck();
      },
    });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
