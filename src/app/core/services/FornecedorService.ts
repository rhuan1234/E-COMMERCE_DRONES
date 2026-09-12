import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Fornecedor } from "../models/Fornecedor";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class FornecedorService{
    private readonly apiUrl = 'http://localhost:8080/fornecedores/admin';

    constructor(private http: HttpClient){}

    findAll(): Observable<Fornecedor[]>{
        return this.http.get<Fornecedor[]>(this.apiUrl);
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