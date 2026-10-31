import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Drone, DroneImagem } from '../../../../core/models/drone/Drone';
import { DroneService } from '../../../../core/services/DroneService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

const TAMANHO_MAXIMO_IMAGEM = 8 * 1024 * 1024;
const TIPOS_DE_IMAGEM = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAXIMO_DE_IMAGENS = 5;

@Component({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-drone-imagem-dialog',
  styleUrl: './drone-imagem-dialog.css',
  templateUrl: './drone-imagem-dialog.html',
})
export class DroneImagemDialog implements OnInit {
  imagens: DroneImagem[] = [];
  arquivoSelecionado: File | null = null;
  carregando = true;
  enviando = false;
  imagemExcluindoId: number | null = null;
  principal = false;
  mensagemErro = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly drone: Drone,
    private readonly droneService: DroneService,
    private readonly dialog: MatDialog,
    private readonly dialogRef: MatDialogRef<DroneImagemDialog>,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarImagens();
  }

  carregarImagens(): void {
    this.carregando = true;
    this.changeDetector.markForCheck();
    this.droneService.findById(this.drone.id).subscribe({
      next: (droneAtualizado) => {
        this.imagens = droneAtualizado.imagens ?? [];
        this.principal = this.imagens.length === 0;
        this.carregando = false;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        console.error('Erro ao carregar imagens do drone:', error);
        this.mensagemErro = 'Não foi possível carregar as imagens do drone.';
        this.carregando = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  selecionarArquivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0] ?? null;
    this.mensagemErro = '';
    this.arquivoSelecionado = null;

    if (!arquivo) {
      return;
    }

    if (this.imagens.length >= MAXIMO_DE_IMAGENS) {
      this.mensagemErro = 'Este drone já possui o limite de 5 imagens.';
    } else if (!TIPOS_DE_IMAGEM.includes(arquivo.type)) {
      this.mensagemErro = 'Formato inválido. Selecione uma imagem JPEG, PNG, GIF ou WebP.';
    } else if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      this.mensagemErro = 'A imagem deve ter no máximo 8 MB.';
    } else {
      this.arquivoSelecionado = arquivo;
    }

    input.value = '';
  }

  enviarImagem(): void {
    if (!this.arquivoSelecionado || this.enviando || this.imagens.length >= MAXIMO_DE_IMAGENS) {
      return;
    }

    const ordem = Math.max(-1, ...this.imagens.map((imagem) => imagem.ordem)) + 1;
    this.enviando = true;
    this.mensagemErro = '';

    this.droneService
      .uploadImagem(this.drone.id, this.arquivoSelecionado, this.principal, ordem)
      .subscribe({
        next: () => {
          this.arquivoSelecionado = null;
          this.enviando = false;
          this.principal = false;
          this.carregarImagens();
        },
        error: (error) => {
          console.error('Erro ao enviar imagem do drone:', error);
          this.mensagemErro =
            error.error?.mensagem ||
            error.error?.message ||
            'Não foi possível enviar a imagem. Verifique o formato, o tamanho e o limite de imagens.';
          this.enviando = false;
          this.changeDetector.markForCheck();
        },
      });
  }

  excluirImagem(imagem: DroneImagem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Remover imagem',
        mensagem: 'Deseja realmente remover esta imagem do drone?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado || this.imagemExcluindoId !== null) {
        return;
      }

      this.imagemExcluindoId = imagem.id;
      this.mensagemErro = '';
      this.droneService.excluirImagem(this.drone.id, imagem.id).subscribe({
        next: () => {
          this.imagens = this.imagens.filter((imagemAtual) => imagemAtual.id !== imagem.id);
          if (this.imagens.length === 0) {
            this.principal = true;
          }
          this.imagemExcluindoId = null;
          this.changeDetector.markForCheck();
        },
        error: (error) => {
          console.error('Erro ao excluir imagem do drone:', error);
          this.mensagemErro = 'Não foi possível remover a imagem. Tente novamente.';
          this.imagemExcluindoId = null;
          this.changeDetector.markForCheck();
        },
      });
    });
  }

  obterUrlImagem(imagem: DroneImagem): string {
    return this.droneService.obterUrlImagem(imagem);
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
