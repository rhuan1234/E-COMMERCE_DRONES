import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Marca } from '../../../../core/models/marca/Marca';
import { Modelo } from '../../../../core/models/modelo/Modelo';
import { MarcaService } from '../../../../core/services/MarcaService';
import { ModeloService } from '../../../../core/services/ModeloService';

@Component({
  imports: [
    ReactiveFormsModule,
    AdminPageHeader,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  selector: 'app-modelo-form',
  styleUrl: './modelo-form.css',
  templateUrl: './modelo-form.html',
})
export class ModeloForm implements OnInit {
  readonly form: FormGroup;
  marcas: Marca[] = [];

  constructor(
    private fb: FormBuilder,
    private modeloService: ModeloService,
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
      marcaId: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.carregarMarcas();

    const modelo = this.activatedRoute.snapshot.data['modelo'] as Modelo | undefined;
    if (modelo) {
      this.form.patchValue({
        id: modelo.id,
        nome: modelo.nome,
        marcaId: modelo.marcaId ?? modelo.marca?.id ?? null,
      });
    }
  }

  carregarMarcas(): void {
    this.marcaService.findAll(0, 100).subscribe({
      next: (response) => {
        this.marcas = response.items;
      },
      error: (error) => {
        console.error('Erro ao carregar marcas:', error);
        this.exibirMensagem('Erro ao carregar as marcas.');
      },
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exibirMensagem('Revise os campos destacados antes de salvar.');
      return;
    }

    const modelo = this.form.getRawValue() as Modelo;
    const resultado = modelo.id
      ? this.modeloService.update(modelo.id, modelo)
      : this.modeloService.create(modelo);

    resultado.subscribe({
      next: () => {
        this.exibirMensagem('Modelo salvo com sucesso!');
        this.router.navigate(['/admin/modelos']);
      },
      error: (error) => {
        console.error('Erro ao salvar modelo:', error);
        this.exibirMensagem('Não foi possível salvar o modelo.');
      },
    });
  }

  excluir(): void {
    const modelo = this.form.getRawValue() as Modelo;
    if (!modelo.id) {
      return;
    }

    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Modelo',
        mensagem: `Deseja realmente excluir o modelo "${modelo.nome}"?`,
      },
    });

    confirmRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.modeloService.delete(modelo.id).subscribe({
        next: () => {
          this.exibirMensagem('Modelo excluído com sucesso!');
          this.router.navigate(['/admin/modelos']);
        },
        error: (error) => {
          console.error('Erro ao excluir modelo:', error);
          const msg =
            error?.status === 409
              ? 'Não é possível excluir o modelo pois há drones ou câmeras associados.'
              : 'Não foi possível excluir o modelo.';
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
    this.router.navigate(['/admin/modelos']);
  }
}
