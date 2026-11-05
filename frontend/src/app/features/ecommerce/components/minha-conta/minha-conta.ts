import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/AuthService';

interface SecaoConta {
  rotulo: string;
  descricao: string;
  rota: string;
  icone: string;
}

/**
 * Área do cliente dentro da loja: dados pessoais, endereços e senha ficam aqui,
 * com o cabeçalho e o rodapé da vitrine, para qualquer perfil autenticado.
 */
@Component({
  imports: [MatIconModule, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-minha-conta',
  styleUrl: './minha-conta.css',
  templateUrl: './minha-conta.html',
})
export class MinhaConta {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly secoes: SecaoConta[] = [
    { rotulo: 'Dados pessoais', descricao: 'Nome, CPF e telefone', rota: '/minha-conta/dados', icone: 'person_outline' },
    { rotulo: 'Endereços', descricao: 'Entrega e cobrança', rota: '/minha-conta/enderecos', icone: 'location_on' },
    { rotulo: 'Segurança', descricao: 'Alterar senha', rota: '/minha-conta/seguranca', icone: 'lock_outline' },
  ];

  sair(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
