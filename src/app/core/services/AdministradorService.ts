import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Administrador } from "../models/administrador/Administrado";
import { Observable } from "rxjs";
import { PagedResponse } from "../models/PagedResponse";

@Injectable({providedIn: 'root'})
export class AdministradorService{
    private readonly apiUrl = 'http://localhost:8080/usuarios/admin';
    private readonly apiUrlEcommerce = 'http://localhost:8080/usuarios';

    constructor(private http: HttpClient){}

    findAll(page: number = 0, pageSize: number = 10): Observable<PagedResponse<Administrador>>{
        return this.http.get<PagedResponse<Administrador>>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
    }

    findByLogin(page: number = 0, pageSize: number = 10, login: string): Observable<PagedResponse<Administrador>> {
        return this.http.get<PagedResponse<Administrador>>(
            `${this.apiUrl}/logins/${encodeURIComponent(login)}?page=${page}&pageSize=${pageSize}`
        );
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