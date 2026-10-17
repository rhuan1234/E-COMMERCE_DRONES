import { Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { Administrador } from '../../../../core/models/administrador/Administrado';
import { AdministradorService } from '../../../../core/services/AdministradorService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  selector: 'app-administrador-form',
  styleUrl: './administrador-form.css',
  templateUrl: './administrador-form.html',
})
export class AdministradorForm implements OnInit {
  readonly form: FormGroup;
  private readonly location = inject(Location);

  constructor(
    private fb: FormBuilder,
    private administradorService: AdministradorService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      id: [null],
      login: ['', [Validators.required, Validators.pattern(/^\S+$/), Validators.minLength(3), Validators.maxLength(40)]],
      senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      perfil: ['ADMIN']
    });
  }

  ngOnInit(): void {
    const administrador = this.activatedRoute.snapshot.data['administrador'] as Administrador | undefined;

    if (administrador) {
      this.form.patchValue(administrador);
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exibirMensagem('Preencha todos os campos obrigatórios.');
      return;
    }

    const administrador = this.form.value as Administrador;
    const resultado = administrador.id
      ? this.administradorService.update(administrador.id, administrador)
      : this.administradorService.create(administrador);

    resultado.subscribe({
      next: () => {
        this.exibirMensagem('Administrador salvo com sucesso!');
        this.router.navigate(['/administradores']);
      },
      error: (error) => {
        this.exibirMensagem('Erro ao salvar o administrador.');
        console.error('Erro ao salvar administrador:', error);
      }
    });
  }

  excluir(): void {
    const administrador = this.form.value as Administrador;

    if (!administrador.id) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Administrador',
        mensagem: `Deseja realmente excluir o administrador "${administrador.login}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.administradorService.delete(administrador.id).subscribe({
        next: () => {
          this.exibirMensagem('Administrador excluído com sucesso!');
          this.router.navigate(['/administradores']);
        },
        error: (error) => {
          this.exibirMensagem('Erro ao excluir o administrador.');
          console.error('Erro ao excluir administrador:', error);
        }
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
    this.location.back();
  }
}
