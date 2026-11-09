import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/AuthService';
import { AuthShell } from '../auth-shell/auth-shell';

@Component({
  imports: [ReactiveFormsModule, RouterLink, AuthShell],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);

  form = this.fb.group({
    login: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
    senha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
  });

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.enviando()) return;

    this.enviando.set(true);
    this.erro.set(null);
    this.authService
      .login({
        login: this.form.value.login!,
        senha: this.form.value.senha!,
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          const returnUrl = this.router.routerState.snapshot.root.queryParamMap.get('returnUrl');
          const destino =
            returnUrl?.startsWith('/') && !returnUrl.startsWith('//') && !returnUrl.startsWith('/login')
              ? returnUrl
              : this.authService.destinoPadrao();
          this.router.navigateByUrl(destino);
        },
        error: (err: unknown) => {
          this.enviando.set(false);
          this.erro.set(this.mensagemDeErro(err));
        },
      });
  }

  private mensagemDeErro(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401 || err.status === 403) return 'Login ou senha incorretos.';
      if (err.status === 0) return 'Não foi possível falar com a loja. Verifique sua conexão e tente de novo.';
      const mensagem = err.error?.message;
      if (typeof mensagem === 'string' && mensagem.trim()) return mensagem;
    }
    return 'Não foi possível entrar agora. Tente de novo em instantes.';
  }
}
