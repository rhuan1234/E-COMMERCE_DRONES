import { Component, inject, Injectable } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
      login: [''],
      senha: [''],
      email: ['']
    }
  )

  register(): void{
    if(this.form.invalid){
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
            this.router.navigate(['/cameras']);
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
