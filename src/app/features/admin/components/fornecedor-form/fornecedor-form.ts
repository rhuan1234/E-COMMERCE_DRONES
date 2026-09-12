import { Location } from '@angular/common';
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FornecedorService } from '../../../../core/services/FornecedorService';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule,
            MatInputModule, MatButtonModule, MatToolbarModule,
            MatSelectModule, MatIconModule, MatSnackBarModule, MatCheckboxModule, MatDialogModule],
  selector: 'app-fornecedor-form',
  styleUrl: './fornecedor-form.css',
  templateUrl: './fornecedor-form.html',
})
export class FornecedorForm implements OnInit {
  readonly form: FormGroup;
  private readonly location = inject(Location);

  constructor(
    private fb: FormBuilder,
    private fornecedorService: FornecedorService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: [''],
      cnpj: [''],
      email: [''],
      ativo: [true],
      telefone: ['']
    })
  }

  ngOnInit(): void {
    const fornecedor = this.activatedRoute.snapshot.data['fornecedor'];

    if (fornecedor) {
      this.form.patchValue(fornecedor);
    }
  }

  salvar() {
    const fornecedor = this.form.value;

    let resultado = (fornecedor.id) ?
      this.fornecedorService.update(fornecedor.id, fornecedor) :
      this.fornecedorService.create(fornecedor);
      
    resultado.subscribe({
      next: () => {
        this.exibirMensagem('Fornecedor salvo com sucesso!');
        this.router.navigate(['/fornecedores']);
      }
  });
  }

  excluir() {
    const fornecedor = this.form.value;

    if (!fornecedor.id) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Fornecedor',
        mensagem: `Deseja realmente excluir o fornecedor "${fornecedor.nome}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.fornecedorService.delete(fornecedor.id).subscribe({
        next: () => {
          this.exibirMensagem('Fornecedor excluído com sucesso!');
          this.router.navigate(['/fornecedores']);
        },
        error: (error) => {
          this.exibirMensagem('Erro ao excluir o fornecedor: ');
          console.log('Erro ao excluir o fornecedor: ', error);
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

  voltar () {
    this.location.back();
  }
}