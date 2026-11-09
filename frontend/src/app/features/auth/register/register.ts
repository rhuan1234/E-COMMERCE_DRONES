import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/AuthService';
import { AuthShell } from '../auth-shell/auth-shell';

type CampoCadastro = 'login' | 'email' | 'senha';

@Component({
  imports: [ReactiveFormsModule, RouterLink, AuthShell],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  form = this.fb.group({
    login: ['', [Validators.required, Validators.pattern(/^\S+$/), Validators.minLength(3), Validators.maxLength(40)]],
    senha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
  });

  register(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.enviando()) return;

    const { login, senha, email } = this.form.getRawValue();
    this.enviando.set(true);
    this.erro.set(null);

    this.authService.register({ login: login!, senha: senha!, email: email! }).subscribe({
      next: () => {
        // Conta criada: entra direto, sem pedir os dados de novo.
        this.authService.login({ login: login!, senha: senha! }).subscribe({
          next: () => {
            this.enviando.set(false);
            this.router.navigateByUrl(this.authService.destinoPadrao());
          },
          error: () => {
            this.enviando.set(false);
            this.router.navigate(['/login']);
          },
        });
      },
      error: (err: unknown) => {
        this.enviando.set(false);
        this.erro.set(this.aplicarErros(err));
      },
    });
  }

  /** Pinta nos campos os erros de validação da API e devolve a mensagem geral. */
  private aplicarErros(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'Não foi possível falar com a loja. Verifique sua conexão e tente de novo.';
      const detalhes: { field?: string; issue?: string }[] = err.error?.error?.details ?? [];
      detalhes.forEach((detalhe) => {
        const campo = detalhe.field?.split('.').pop() as CampoCadastro | undefined;
        const controle = campo ? this.form.controls[campo] : undefined;
        if (controle && detalhe.issue) {
          controle.setErrors({ serverError: detalhe.issue });
          controle.markAsTouched();
        }
      });
      const mensagem = err.error?.message;
      if (typeof mensagem === 'string' && mensagem.trim()) return mensagem;
    }
    return 'Não foi possível criar sua conta agora. Tente de novo em instantes.';
  }
}
