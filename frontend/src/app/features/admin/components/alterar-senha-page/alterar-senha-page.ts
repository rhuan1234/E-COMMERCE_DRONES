import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PerfilService } from '../../../../core/services/PerfilService';

@Component({
  selector: 'app-alterar-senha-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './alterar-senha-page.html',
  styleUrl: './alterar-senha-page.css'
})
export class AlterarSenhaPage {
  private readonly fb = inject(FormBuilder);
  private readonly perfilService = inject(PerfilService);

  mostrarSenhaAtual = false;
  mostrarNovaSenha = false;
  mostrarConfirmacao = false;

  alterandoSenha = false;

  mensagemSenha = '';
  erroSenha = '';

  senhaForm = this.fb.group(
    {
      senhaAtual: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      novaSenha: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100)
        ]
      ],

      confirmarSenha: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ]
    },
    {
      validators: (form) => {
        const novaSenha = form.get('novaSenha')?.value;
        const confirmarSenha = form.get('confirmarSenha')?.value;

        if (!confirmarSenha) {
          return null;
        }

        return novaSenha === confirmarSenha
          ? null
          : { senhasDiferentes: true };
      }
    }
  );

  alterarSenha(): void {
    this.mensagemSenha = '';
    this.erroSenha = '';

    if (this.senhaForm.invalid || this.alterandoSenha) {
      this.senhaForm.markAllAsTouched();
      return;
    }

    const { senhaAtual, novaSenha } = this.senhaForm.getRawValue();

    if (!senhaAtual || !novaSenha) {
      return;
    }

    this.alterandoSenha = true;

    this.perfilService.alterarSenha({
      senhaAtual,
      novaSenha
    }).subscribe({
      next: () => {
        this.mensagemSenha = 'Senha alterada com sucesso!';

        this.senhaForm.reset();

        this.alterandoSenha = false;
        this.mostrarSenhaAtual = false;
        this.mostrarNovaSenha = false;
        this.mostrarConfirmacao = false;
      },

      error: (erro) => {
        console.error('Erro ao alterar senha:', erro);

        this.erroSenha =
          erro.error?.message ||
          'Não foi possível alterar a senha. Verifique sua senha atual e tente novamente.';

        this.alterandoSenha = false;
      }
    });
  }

  limparMensagens(): void {
    this.mensagemSenha = '';
    this.erroSenha = '';
  }
}