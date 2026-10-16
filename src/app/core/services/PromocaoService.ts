import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PromocaoRequest } from "../models/promocao/PromocaoRequest";
import { PagedResponse } from "./DroneService";

@Injectable({ providedIn: 'root' })
export class PromocaoService {
    private readonly apiUrl = 'http://localhost:8080/promocoes/admin';
    private readonly apiUrlEcommerce = 'http://localhost:8080/promocoes';

    constructor(private http: HttpClient) { }

    findAll(page: number = 0, pageSize: number = 10): Observable<PagedResponse<PromocaoRequest>> {
        return this.http.get<PagedResponse<PromocaoRequest>>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
    }

    findByNome(page: number = 0, pageSize: number = 10, nome: string): Observable<PagedResponse<PromocaoRequest>> {
        return this.http.get<PagedResponse<PromocaoRequest>>(
            `${this.apiUrlEcommerce}/nomes/${encodeURIComponent(nome)}?page=${page}&pageSize=${pageSize}`
        );
    }

    findById(id: string | null | number): Observable<PromocaoRequest> {
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