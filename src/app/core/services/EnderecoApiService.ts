import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Endereco } from '../models/endereco/Endereco';
import { EnderecoRequest } from '../models/endereco/EnderecoRequest';
import { PagedResponse } from '../models/PagedResponse';

@Injectable({
  providedIn: 'root'
})
export class EnderecoApiService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/clientes';

  listar(
    page: number = 0,
    pageSize: number = 10
  ): Observable<PagedResponse<Endereco>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PagedResponse<Endereco>>(
      `${this.apiUrl}/enderecos`,
      { params }
    );
  }

  obterPrincipal(): Observable<Endereco> {
    return this.http.get<Endereco>(
      `${this.apiUrl}/obter-endereco-principal`
    );
  }

  adicionar(dados: EnderecoRequest): Observable<Endereco> {
    return this.http.post<Endereco>(
      `${this.apiUrl}/adicionar-endereco`,
      dados
    );
  }

  editar(
    id: number,
    dados: EnderecoRequest
  ): Observable<Endereco> {
    return this.http.put<Endereco>(
      `${this.apiUrl}/editar-endereco/${id}`,
      dados
    );
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/remover-endereco/${id}`
    );
  }
}