import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  titulo: string;
  mensagem: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  template: `
    <div class="max-w-[440px] p-6 font-body text-ink">
      <div class="flex items-start gap-4">
        <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger" aria-hidden="true">
          <mat-icon>warning_amber</mat-icon>
        </span>
        <div class="min-w-0">
          <h2 mat-dialog-title class="confirm-title !m-0 !p-0 font-display !text-lg !font-extrabold !leading-snug !text-ink">
            {{ data.titulo }}
          </h2>
          <mat-dialog-content class="!m-0 !p-0">
            <p class="m-0 mt-1.5 text-[15px] leading-relaxed text-muted">{{ data.mensagem }}</p>
          </mat-dialog-content>
        </div>
      </div>
      <mat-dialog-actions class="!mt-6 !flex !justify-end !gap-2 !p-0">
        <button
          type="button"
          class="inline-flex h-11 cursor-pointer items-center rounded-xl border border-line-strong bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-mist"
          (click)="onCancel()"
          cdkFocusInitial>
          Cancelar
        </button>
        <button
          type="button"
          class="inline-flex h-11 cursor-pointer items-center rounded-xl border-0 bg-danger px-4 text-sm font-semibold text-white transition-colors hover:bg-[#7f2219]"
          (click)="onConfirm()">
          Confirmar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .confirm-title::before {
      display: none;
    }
  `,
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
