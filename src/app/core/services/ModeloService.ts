import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResponse } from '../models/PagedResponse';
import { Modelo } from '../models/modelo/Modelo';

@Injectable({ providedIn: 'root' })
export class ModeloService {
  private readonly apiUrl = 'http://localhost:8080/modelos/admin';
  private readonly apiUrlEcommerce = 'http://localhost:8080/modelos';

  constructor(private http: HttpClient) {}

  findAll(page: number = 0, pageSize: number = 10): Observable<PagedResponse<Modelo>> {
    return this.http.get<PagedResponse<Modelo>>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
  }

  findByMarca(marcaId: number, page: number = 0, pageSize: number = 100): Observable<PagedResponse<Modelo>> {
    return this.http.get<PagedResponse<Modelo>>(
      `${this.apiUrlEcommerce}/marcas/${marcaId}?page=${page}&pageSize=${pageSize}`
    );
  }

  findByNome(page: number = 0, pageSize: number = 10, nome: string): Observable<PagedResponse<Modelo>> {
    return this.http.get<PagedResponse<Modelo>>(
      `${this.apiUrlEcommerce}/nomes/${encodeURIComponent(nome)}?page=${page}&pageSize=${pageSize}`
    );
  }

  findById(id: any): Observable<Modelo> {
    return this.http.get<Modelo>(`${this.apiUrl}/${id}`);
  }

  create(modelo: Modelo): Observable<Modelo> {
    return this.http.post<Modelo>(this.apiUrl, modelo);
  }

  update(id: any, modelo: Modelo): Observable<Modelo> {
    return this.http.put<Modelo>(`${this.apiUrl}/${id}`, modelo);
  }

  delete(id: any): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
