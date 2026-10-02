import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PromocaoRequest } from "../models/promocao/PromocaoRequest";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class PromocaoService{
    private readonly apiUrl = 'http://localhost:8080/promocoes/admin';

    constructor(private http: HttpClient){}

    findAll(): Observable<PromocaoRequest[]>{
        return this.http.get<PromocaoRequest[]>(this.apiUrl);
    }

    findById(id: string | null | number): Observable<PromocaoRequest>{
        return this.http.get<PromocaoRequest>(`${this.apiUrl}/${id}`);
    }

    create(promocao: PromocaoRequest): Observable<PromocaoRequest> {
            return this.http.post<PromocaoRequest>(this.apiUrl, promocao);
        }
        
    update(id: any, promocao: PromocaoRequest): Observable<PromocaoRequest> {
            return this.http.put<PromocaoRequest>(`${this.apiUrl}/${id}`, promocao);
        }
    
    delete(id: any): Observable<void> {
            return this.http.delete<void>(`${this.apiUrl}/${id}`);
        }
}