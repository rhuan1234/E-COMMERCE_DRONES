import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Avaliacao } from '../models/drone/Avaliacao';
import { AvaliacaoRequest } from '../models/drone/AvaliacaoRequest';
import { PagedResponse } from '../models/PagedResponse';

@Injectable({ providedIn: 'root' })
export class AvaliacaoService {
  private readonly apiUrl = 'http://localhost:8080/avaliacoes';

  constructor(private readonly http: HttpClient) {}

  listarPorDrone(droneId: number, page: number, pageSize = 5): Observable<PagedResponse<Avaliacao>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<PagedResponse<Avaliacao>>(`${this.apiUrl}/drone/${droneId}`, { params });
  }

  criar(dados: AvaliacaoRequest): Observable<Avaliacao> {
    return this.http.post<Avaliacao>(this.apiUrl, dados);
  }
}
