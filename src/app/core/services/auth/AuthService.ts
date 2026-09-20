import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../../models/auth/LoginRequest';
import { LoginResponse } from '../../models/auth/LoginResponse';
import { RegisterRequest } from '../../models/auth/RegisterRequest';

@Injectable({providedIn: 'root'})
export class AuthService{
 private readonly apiUrl = 'http://localhost:8080';

 constructor(private http: HttpClient){}

 login(dados: LoginRequest): Observable<LoginResponse>{
    return this.http.post<LoginResponse>(this.apiUrl + '/auth/login', dados)
    .pipe(
        tap(response =>{
        localStorage.setItem('token', response.token);
        }
    )
    );
 }

 register(dados: RegisterRequest): Observable<RegisterRequest>{
   return this.http.post<RegisterRequest>(this.apiUrl + '/clientes', dados);
 }


 logout(): void{
    localStorage.removeItem('token');
 }

 getToken(): string | null{
    return localStorage.getItem('token');
 }

 isAuthenticated(): boolean{
   if(localStorage.getItem('token')){
      return true
   }
    
    return false
 }
}