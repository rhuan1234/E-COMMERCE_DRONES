import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PerfilService } from '../../../../core/services/PerfilService';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.css',
})
export class PerfilPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly perfilService = inject(PerfilService);
  private readonly cdr = inject(ChangeDetectorRef);

  carregando = false;
  erroCarregamento = '';

  perfilForm = this.fb.group({
    login: [{ value: '', disabled: true }],
    nomeCompleto: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(2), Validators.maxLength(120)]],
    email: [{ value: '', disabled: true }],
    cpf: ['', [Validators.required, Validators.pattern(/^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/)]],
    telefone: ['', [Validators.required, Validators.pattern(/^(?:\d{10,11}|(?:\+?55\s?)?\(\d{2}\)\s?9?\d{4}-?\d{4})$/)]]
  });


  ngOnInit(): void {
    this.carregarPerfil();
  }

  carregarPerfil(): void {
    this.carregando = true;
    this.erroCarregamento = '';

    this.perfilService.obterPerfil().subscribe({
      next: (perfil) => {
        this.perfilForm.patchValue({
          login: perfil.login,
          nomeCompleto: perfil.nomeCompleto,
          email: perfil.email,
          cpf: perfil.cpf,
          telefone: perfil.telefone
        });

        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (erro) => {
        console.error('Erro ao carregar perfil:', erro);

        this.erroCarregamento =
          'Não foi possível carregar seus dados.';

        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  salvando = false;
  mensagemSucesso = '';
  erroSalvamento = '';

salvarPerfil(): void {
  if (this.perfilForm.invalid || this.salvando) {
    this.perfilForm.markAllAsTouched();
    return;
  }

  const dados = {
    nomeCompleto:
      this.perfilForm.controls.nomeCompleto.value ?? '',

    cpf:
      this.perfilForm.controls.cpf.value ?? '',

    telefone:
      this.perfilForm.controls.telefone.value ?? ''
  };

  this.salvando = true;
  this.mensagemSucesso = '';
  this.erroSalvamento = '';

  this.perfilService.atualizarPerfil(dados).subscribe({
    next: (perfilAtualizado) => {
      this.perfilForm.patchValue({
        login: perfilAtualizado.login,
        nomeCompleto: perfilAtualizado.nomeCompleto,
        email: perfilAtualizado.email,
        cpf: perfilAtualizado.cpf,
        telefone: perfilAtualizado.telefone
      });

      this.mensagemSucesso = 'Dados atualizados com sucesso!';
      this.salvando = false;
      this.cdr.markForCheck();
    },

    error: (erro) => {
      console.error('Erro ao atualizar perfil:', erro);

      this.erroSalvamento =
        erro.error?.message ??
        'Não foi possível salvar as alterações.';

      this.salvando = false;
      this.cdr.markForCheck();
    }
  });
}
}
