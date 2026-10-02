import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Fornecedor } from "../models/fornecedor/FornecedorRequest";
import { Observable } from "rxjs";
import { PagedResponse } from "../models/PagedResponse";

@Injectable({providedIn: 'root'})
export class FornecedorService{
    private readonly apiUrl = 'http://localhost:8080/fornecedores/admin';

    constructor(private http: HttpClient){}

    findAll(page: number = 0, pageSize: number = 10): Observable<PagedResponse<Fornecedor>>{
        return this.http.get<PagedResponse<Fornecedor>>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
    }

    findById(id: string | null): Observable<Fornecedor>{
        return this.http.get<Fornecedor>(`${this.apiUrl}/${id}`);
    }

    create(fornecedor: Fornecedor): Observable<Fornecedor> {
            return this.http.post<Fornecedor>(this.apiUrl, fornecedor);
        }
        
    update(id: any, fornecedor: Fornecedor): Observable<Fornecedor> {
            return this.http.put<Fornecedor>(`${this.apiUrl}/${id}`, fornecedor);
        }
    
    delete(id: any): Observable<void> {
            return this.http.delete<void>(`${this.apiUrl}/${id}`);
        }
}