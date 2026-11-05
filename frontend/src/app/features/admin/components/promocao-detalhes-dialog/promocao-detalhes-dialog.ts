import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PromocaoRequest } from '../../../../core/models/promocao/PromocaoRequest';
import { PromocaoService } from '../../../../core/services/PromocaoService';

@Component({
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  selector: 'app-promocao-detalhes-dialog',
  styleUrl: './promocao-detalhes-dialog.css',
  templateUrl: './promocao-detalhes-dialog.html',
})
export class PromocaoDetalhesDialog implements OnInit {
  /** O app roda sem Zone.js: avisa o Angular quando uma resposta assíncrona muda o estado. */
  private readonly cdr = inject(ChangeDetectorRef);

  promocao: PromocaoRequest;
  carregando = true;
  erro = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) promocao: PromocaoRequest,
    private readonly promocaoService: PromocaoService,
    private readonly dialogRef: MatDialogRef<PromocaoDetalhesDialog>
  ) {
    this.promocao = promocao;
  }

  ngOnInit(): void {
    this.promocaoService.findById(this.promocao.id).subscribe({
      next: (promocao) => {
        this.promocao = promocao;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes da promoção:', error);
        this.erro = 'Não foi possível carregar os detalhes da promoção.';
        this.carregando = false;
        this.cdr.markForCheck();
      },
    });
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
