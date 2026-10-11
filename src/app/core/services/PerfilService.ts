import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfilUsuario } from '../models/perfil/PerfilUsuario';
import { AtualizarPerfilRequest } from '../models/perfil/AtualizarPerfilRequest';

export interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080';

  obterPerfil(): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(
      `${this.apiUrl}/clientes`
    );
  }

  atualizarPerfil(
    dados: AtualizarPerfilRequest
  ): Observable<PerfilUsuario> {
    return this.http.put<PerfilUsuario>(
      `${this.apiUrl}/clientes`,
      dados
    );
  }

  alterarSenha(dados: AlterarSenhaRequest): Observable<void> {
  return this.http.patch<void>(
    `${this.apiUrl}/clientes/senha`,
    dados
  );
}
}