import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Administrador } from "../models/administrador/Administrado";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class AdministradorService{
    private readonly apiUrl = 'http://localhost:8080/usuarios/admin';

    constructor(private http: HttpClient){}

    findAll(): Observable<Administrador[]>{
        return this.http.get<Administrador[]>(this.apiUrl);
    }

    findById(id: string | null): Observable<Administrador>{
        return this.http.get<Administrador>(`${this.apiUrl}/${id}`);
    }

    create(administrador: Administrador): Observable<Administrador> {
            return this.http.post<Administrador>(this.apiUrl, administrador);
        }
        
    update(id: any, administrador: Administrador): Observable<Administrador> {
            return this.http.put<Administrador>(`${this.apiUrl}/${id}`, administrador);
        }
    
    delete(id: any): Observable<void> {
            return this.http.delete<void>(`${this.apiUrl}/${id}`);
        }
}