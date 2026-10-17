import { Component, inject, Injectable } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/AuthService';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})

@Injectable({providedIn: 'root'})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group(
    {
      login: ['', [Validators.required, Validators.pattern(/^\S+$/), Validators.minLength(3), Validators.maxLength(40)]],
      senha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]]
    }
  )

  register(): void{
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    this.authService.register({
      login: this.form.value.login!,
      senha: this.form.value.senha!,
      email: this.form.value.email!
    })
    .subscribe({
      next: () => {
        this.authService.login({
          login: this.form.value.login!,
          senha: this.form.value.senha!
        })
        .subscribe({
          next: () => {
            this.router.navigate(['/drones']);
          },
          error: (err) => {
            console.error('Erro ao fazer o login após o cadastro', err);
          }
        })
      },
      error: (err) =>{
        console.error('Erro ao tentar fazer o cadastro!', err)
      }
        })
      }
    }
