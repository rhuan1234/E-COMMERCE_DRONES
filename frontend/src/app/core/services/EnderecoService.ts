import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EnderecoResponse } from '../models/endereco/EnderecoResponse';

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private readonly baseUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  buscarCep(cep: string): Observable<EnderecoResponse> {
    const cepLimpo = cep ? cep.replace(/\D/g, '') : '';
    if (cepLimpo.length !== 8) {
      return of({ erro: true } as EnderecoResponse);
    }
    return this.http.get<EnderecoResponse>(`${this.baseUrl}/${cepLimpo}/json/`);
  }

  consultarCep(cep: string): Observable<EnderecoResponse> {
    return this.buscarCep(cep);
  }

  findByCep(cep: string): Observable<EnderecoResponse> {
    return this.buscarCep(cep);
  }
}
