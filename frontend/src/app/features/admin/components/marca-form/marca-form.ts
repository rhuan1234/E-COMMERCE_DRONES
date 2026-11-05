import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Marca } from '../../../../core/models/marca/Marca';
import { MarcaService } from '../../../../core/services/MarcaService';

@Component({
  imports: [
    ReactiveFormsModule,
    AdminPageHeader,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  selector: 'app-marca-form',
  styleUrl: './marca-form.css',
  templateUrl: './marca-form.html',
})
export class MarcaForm implements OnInit {
  readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private marcaService: MarcaService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: [
        '',
        [
          Validators.required,
          Validators.pattern(/\S/),
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
    });
  }

  ngOnInit(): void {
    const marca = this.activatedRoute.snapshot.data['marca'] as Marca | undefined;
    if (marca) {
      this.form.patchValue(marca);
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exibirMensagem('Revise os campos destacados antes de salvar.');
      return;
    }

    const marca = this.form.getRawValue() as Marca;
    const resultado = marca.id
      ? this.marcaService.update(marca.id, marca)
      : this.marcaService.create(marca);

    resultado.subscribe({
      next: () => {
        this.exibirMensagem('Marca salva com sucesso!');
        this.router.navigate(['/admin/marcas']);
      },
      error: (error) => {
        console.error('Erro ao salvar marca:', error);
        this.exibirMensagem('Não foi possível salvar a marca.');
      },
    });
  }

  excluir(): void {
    const marca = this.form.getRawValue() as Marca;
    if (!marca.id) {
      return;
    }

    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Marca',
        mensagem: `Deseja realmente excluir a marca "${marca.nome}"?`,
      },
    });

    confirmRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.marcaService.delete(marca.id).subscribe({
        next: () => {
          this.exibirMensagem('Marca excluída com sucesso!');
          this.router.navigate(['/admin/marcas']);
        },
        error: (error) => {
          console.error('Erro ao excluir marca:', error);
          const msg =
            error?.status === 409
              ? 'Não é possível excluir a marca pois há modelos, drones ou câmeras associados.'
              : 'Não foi possível excluir a marca.';
          this.exibirMensagem(msg);
        },
      });
    });
  }

  exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'Ok', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  voltar(): void {
    this.router.navigate(['/admin/marcas']);
  }
}
