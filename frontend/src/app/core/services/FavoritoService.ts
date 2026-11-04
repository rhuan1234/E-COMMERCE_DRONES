import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Drone } from '../models/drone/Drone';
import { PagedResponse } from '../models/PagedResponse';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private readonly apiUrl = 'http://localhost:8080/favoritos';

  constructor(private readonly http: HttpClient) {}

  listar(page = 0, pageSize = 10): Observable<PagedResponse<Drone>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedResponse<Drone>>(`${this.apiUrl}/listar`, { params });
  }

  adicionar(droneId: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${droneId}`, null, { responseType: 'text' });
  }

  remover(droneId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${droneId}`, { responseType: 'text' });
  }
}
