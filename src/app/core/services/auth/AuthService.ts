import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import { Observable, tap } from 'rxjs';

interface LoginRequest{
    login: string;
    senha: string;
}

interface LoginResponse{
    token: string;
}

@Injectable({providedIn: 'root'})
export class AuthService{
 private readonly apiUrl = 'http://localhost:8080/auth/login';

 constructor(private http: HttpClient){}

 login(dados: LoginRequest): Observable<LoginResponse>{
    return this.http.post<LoginResponse>(this.apiUrl, dados)
    .pipe(
        tap(response =>{
        localStorage.setItem('token', response.token);
        }
    )
    );
 }

 logout(): void{
    localStorage.removeItem('token');
 }

 getToken(): string | null{
    return localStorage.getItem('token');
 }

 isAuthenticated(): boolean{
    const token = localStorage.getItem('token');
    return !!token;
 }
}