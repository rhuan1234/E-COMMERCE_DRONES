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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FornecedorService } from '../../../../core/services/FornecedorService';
import { EnderecoService } from '../../../../core/services/EnderecoService';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { MatDivider } from '@angular/material/divider';
import { MatStepper, MatStepperNext, MatStepperPrevious, MatStep } from '@angular/material/stepper';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatToolbarModule,
    MatSelectModule, MatIconModule, MatSnackBarModule, MatCheckboxModule, MatDialogModule,
    MatDivider, MatStepper, MatStepperNext, MatStepperPrevious, MatStep, MatProgressSpinner],
  selector: 'app-fornecedor-form',
  styleUrl: './fornecedor-form.css',
  templateUrl: './fornecedor-form.html',
})
export class FornecedorForm implements OnInit {
  readonly form: FormGroup;
  private readonly location = inject(Location);
  private readonly enderecoService = inject(EnderecoService);
  carregandoCep = false;

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
      nome: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(2), Validators.maxLength(100)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^(?:\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      ativo: [true],
      telefone: ['', [Validators.required, Validators.pattern(/^(?:\d{10,11}|(?:\+?55\s?)?\(\d{2}\)\s?9?\d{4}-?\d{4})$/)]],
      endereco: this.fb.group({
        cep: ['', [Validators.required, Validators.pattern(/^(?:\d{8}|\d{5}-\d{3})$/)]],
        rua: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)]],
        bairro: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(80)]],
        cidade: this.fb.group({
          nome: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(80)]],
          estado: this.fb.group({
            nome: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ]{2}$/)]]
          })
        })
      })
      
    })
  }

  ngOnInit(): void {
    const fornecedor = this.activatedRoute.snapshot.data['fornecedor'];

    if (fornecedor) {
      this.form.patchValue(fornecedor);
    }
  }

  buscarCep(mostrarAlertaSeVazio: boolean = true): void {
    const cepControl = this.form.get('endereco.cep');
    const cep = cepControl?.value;

    if (!cep || !cep.toString().trim()) {
      if (mostrarAlertaSeVazio) {
        this.exibirMensagem('Informe o CEP para consulta.');
      }
      return;
    }

    const cleanCep = cep.toString().replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      if (mostrarAlertaSeVazio) {
        this.exibirMensagem('CEP inválido! O CEP deve conter 8 dígitos.');
      }
      return;
    }

    this.carregandoCep = true;
    this.enderecoService.buscarCep(cleanCep).subscribe({
      next: (dados) => {
        this.carregandoCep = false;
        if (dados.erro === true || dados.erro === 'true') {
          this.exibirMensagem('CEP não encontrado!');
          return;
        }

        this.form.patchValue({
          endereco: {
            cep: dados.cep || cleanCep,
            rua: dados.logradouro || '',
            bairro: dados.bairro || '',
            cidade: {
              nome: dados.localidade || '',
              estado: {
                nome: dados.uf || ''
              }
            }
          }
        });
      },
      error: (error) => {
        this.carregandoCep = false;
        this.exibirMensagem('Erro ao consultar o CEP no ViaCEP.');
        console.error('Erro ao consultar o CEP: ', error);
      }
    });
  }

  consultarCep(mostrarAlertaSeVazio: boolean = true): void {
    this.buscarCep(mostrarAlertaSeVazio);
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exibirMensagem('Revise os campos destacados antes de salvar.');
      return;
    }

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