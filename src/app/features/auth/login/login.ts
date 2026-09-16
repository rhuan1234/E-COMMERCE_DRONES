import { Component, inject, Injectable } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/AuthService';
import { Router } from '@angular/router';

@Component({
  imports: [ ReactiveFormsModule ],
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
    login: [''],
    senha: ['']
  })

  login(): void{
    if(this.form.invalid){
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
