import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Drone } from '../models/drone/Drone';
import { Observable } from 'rxjs';

import { PagedResponse } from '../models/PagedResponse';
import { DroneImagem } from '../models/drone/Drone';

export type { PagedResponse };

@Injectable({ providedIn: 'root' })
export class DroneService {
  private readonly apiUrl = 'http://localhost:8080/drones/admin';
  private readonly apiUrlEcommerce = 'http://localhost:8080/drones';

  constructor(private http: HttpClient) { }

  findAll(page: number = 0, pageSize: number = 10): Observable<PagedResponse<Drone>> {
    return this.http.get<PagedResponse<Drone>>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
  }

  findByModelo(page: number = 0, pageSize: number = 10, modelo: string): Observable<PagedResponse<Drone>> {
    return this.http.get<PagedResponse<Drone>>(`${this.apiUrlEcommerce}/modelos/${modelo}?page=${page}&pageSize=${pageSize}`);
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
