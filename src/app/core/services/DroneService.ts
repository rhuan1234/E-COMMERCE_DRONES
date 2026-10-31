import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Drone } from '../models/drone/Drone';
import { Observable, map } from 'rxjs';

import { PagedResponse } from '../models/PagedResponse';
import { DroneImagem } from '../models/drone/Drone';

export type { PagedResponse };

export interface DroneFiltroParams {
  nome?: string;
  marca?: string;
  modelo?: string;
  min?: number | null;
  max?: number | null;
}

@Injectable({ providedIn: 'root' })
export class DroneService {
  private readonly apiUrl = 'http://localhost:8080/drones/admin';
  private readonly apiUrlEcommerce = 'http://localhost:8080/drones';

  constructor(private http: HttpClient) { }

  findAll(
    page: number = 0,
    pageSize: number = 10,
    filtros?: DroneFiltroParams,
  ): Observable<PagedResponse<Drone>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filtros) {
      if (filtros.nome && filtros.nome.trim()) {
        params = params.set('nome', filtros.nome.trim());
      }
      if (filtros.marca && filtros.marca.trim()) {
        params = params.set('marca', filtros.marca.trim());
      }
      if (filtros.modelo && filtros.modelo.trim()) {
        params = params.set('modelo', filtros.modelo.trim());
      }
      if (filtros.min !== null && filtros.min !== undefined && !Number.isNaN(filtros.min)) {
        params = params.set('min', filtros.min.toString());
      }
      if (filtros.max !== null && filtros.max !== undefined && !Number.isNaN(filtros.max)) {
        params = params.set('max', filtros.max.toString());
      }
    }

    return this.http.get<PagedResponse<Drone>>(this.apiUrl, { params });
  }

  findAllEcommerce(
    page: number = 0,
    pageSize: number = 10,
    filtros?: DroneFiltroParams,
  ): Observable<PagedResponse<Drone>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filtros) {
      if (filtros.nome && filtros.nome.trim()) {
        params = params.set('nome', filtros.nome.trim());
      }
      if (filtros.marca && filtros.marca.trim()) {
        params = params.set('marca', filtros.marca.trim());
      }
      if (filtros.modelo && filtros.modelo.trim()) {
        params = params.set('modelo', filtros.modelo.trim());
      }
      if (filtros.min !== null && filtros.min !== undefined && !Number.isNaN(filtros.min)) {
        params = params.set('min', filtros.min.toString());
      }
      if (filtros.max !== null && filtros.max !== undefined && !Number.isNaN(filtros.max)) {
        params = params.set('max', filtros.max.toString());
      }
    }

    return this.http.get<PagedResponse<Drone>>(this.apiUrlEcommerce, { params });
  }

  findByModelo(page: number = 0, pageSize: number = 10, modelo: string): Observable<PagedResponse<Drone>> {
    return this.http.get<PagedResponse<Drone>>(
      `${this.apiUrlEcommerce}/modelos/${encodeURIComponent(modelo)}?page=${page}&pageSize=${pageSize}`,
    );
  }

  findByMarca(page: number = 0, pageSize: number = 10, marca: string): Observable<PagedResponse<Drone>> {
    return this.http.get<PagedResponse<Drone>>(
      `${this.apiUrlEcommerce}/marcas/${encodeURIComponent(marca)}?page=${page}&pageSize=${pageSize}`,
    );
  }

  findByNome(nome: string): Observable<PagedResponse<Drone>> {
    return this.http.get<Drone>(`${this.apiUrl}/nomes/${encodeURIComponent(nome)}`).pipe(
      map((drone) => ({
        items: drone ? [drone] : [],
        page: 0,
        pageSize: 1,
        totalItems: drone ? 1 : 0,
        totalPages: drone ? 1 : 0,
      })),
    );
  }

  findByPreco(page: number = 0, pageSize: number = 10, min: number, max: number): Observable<PagedResponse<Drone>> {
    return this.http.get<PagedResponse<Drone>>(
      `${this.apiUrlEcommerce}/preco/?page=${page}&pageSize=${pageSize}&min=${min}&max=${max}`,
    );
  }

  findById(id: any): Observable<Drone> {
    return this.http.get<Drone>(`${this.apiUrl}/${id}`);
  }

  create(droneRequest: Drone): Observable<Drone> {
    return this.http.post<Drone>(this.apiUrl, droneRequest);
  }

  update(id: any, droneRequest: Drone): Observable<Drone> {
    return this.http.put<Drone>(`${this.apiUrl}/${id}`, droneRequest);
  }

  delete(id: any): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImagem(
    droneId: number,
    arquivo: File,
    principal: boolean,
    ordem: number
  ): Observable<Drone> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('principal', String(principal));
    formData.append('ordem', String(ordem));

    return this.http.post<Drone>(`${this.apiUrl}/${droneId}/imagens`, formData);
  }

  excluirImagem(droneId: number, imagemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${droneId}/imagens/${imagemId}`);
  }

  obterUrlImagem(imagem: DroneImagem): string {
    if (/^https?:\/\//i.test(imagem.caminho)) {
      return imagem.caminho;
    }

    return `http://localhost:8080${imagem.caminho.startsWith('/') ? '' : '/'}${imagem.caminho}`;
  }
}
