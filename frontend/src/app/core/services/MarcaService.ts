import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResponse } from '../models/PagedResponse';
import { Marca } from '../models/marca/Marca';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private readonly apiUrl = 'http://localhost:8080/marcas/admin';
  private readonly apiUrlEcommerce = 'http://localhost:8080/marcas';

  constructor(private http: HttpClient) {}

  findAll(page: number = 0, pageSize: number = 10): Observable<PagedResponse<Marca>> {
    return this.http.get<PagedResponse<Marca>>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
  }

  findByNome(page: number = 0, pageSize: number = 10, nome: string): Observable<PagedResponse<Marca>> {
    return this.http.get<PagedResponse<Marca>>(
      `${this.apiUrlEcommerce}/nomes/${encodeURIComponent(nome)}?page=${page}&pageSize=${pageSize}`
    );
  }

  findById(id: any): Observable<Marca> {
    return this.http.get<Marca>(`${this.apiUrl}/${id}`);
  }

  create(marca: Marca): Observable<Marca> {
    return this.http.post<Marca>(this.apiUrl, marca);
  }

  update(id: any, marca: Marca): Observable<Marca> {
    return this.http.put<Marca>(`${this.apiUrl}/${id}`, marca);
  }

  delete(id: any): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
