import { Component, inject, Injectable } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/AuthService';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [ ReactiveFormsModule, RouterLink ],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
@Injectable({providedIn: 'root'})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    login: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
    senha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]]
  })

  login(): void{
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    this.authService.login({
      login: this.form.value.login!,
      senha: this.form.value.senha!
    })
    .subscribe({
      next: () =>{
        this.router.navigate(['/fornecedores']);
      },

      error: (err) =>{
        console.error('Login failed', err);
      }

    })
  }
  

}
