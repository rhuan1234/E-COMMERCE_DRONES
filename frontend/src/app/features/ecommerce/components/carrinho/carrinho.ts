import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, take } from 'rxjs';
import { Endereco } from '../../../../core/models/endereco/Endereco';
import { CheckoutResponse, MetodoPagamentoCheckout } from '../../../../core/models/checkout/Checkout';
import { DroneImagem } from '../../../../core/models/drone/Drone';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { CarrinhoService } from '../../../../core/services/CarrinhoService';
import { CheckoutApiService } from '../../../../core/services/CheckoutApiService';
import { DroneService } from '../../../../core/services/DroneService';
import { EnderecoApiService } from '../../../../core/services/EnderecoApiService';
import { PerfilService } from '../../../../core/services/PerfilService';
import { TituloPagina } from '../../../../shared/components/titulo-pagina/titulo-pagina';

type EtapaCheckout = 'carrinho' | 'endereco' | 'pagamento' | 'concluido';

@Component({
  imports: [MatIconModule, RouterLink, TituloPagina],
  selector: 'app-carrinho',
  standalone: true,
  templateUrl: './carrinho.html',
})
export class Carrinho implements OnInit {
  readonly carrinho = inject(CarrinhoService);
  readonly etapa = signal<EtapaCheckout>('carrinho');
  readonly enderecos = signal<Endereco[]>([]);
  readonly enderecoSelecionado = signal<number | null>(null);
  readonly metodoPagamento = signal<MetodoPagamentoCheckout>('PIX');
  readonly pedidoFinalizado = signal<CheckoutResponse | null>(null);
  readonly carregando = signal(false);
  readonly erro = signal('');

  private readonly droneService = inject(DroneService);
  private readonly auth = inject(AuthService);
  private readonly checkoutApi = inject(CheckoutApiService);
  private readonly enderecoApi = inject(EnderecoApiService);
  private readonly perfilService = inject(PerfilService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly moeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  ngOnInit(): void {
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      if (params.get('checkout') === 'true' && this.carrinho.itens().length > 0) {
        this.iniciarCheckout();
      }
    });
  }

  formatarPreco(valor: number): string {
    return this.moeda.format(valor);
  }

  obterUrlImagem(imagem: DroneImagem): string {
    return this.droneService.obterUrlImagem(imagem);
  }

  alterarQuantidade(droneId: number, quantidade: number): void {
    this.carrinho.definirQuantidade(droneId, quantidade);
  }

  remover(droneId: number): void {
    this.carrinho.remover(droneId);
  }

  iniciarCheckout(): void {
    if (this.carregando()) {
      return;
    }
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/carrinho?checkout=true' },
      });
      return;
    }
    if (this.carrinho.itens().length === 0) {
      this.erro.set('Adicione ao menos um drone ao carrinho para continuar.');
      return;
    }

    this.erro.set('');
    this.carregando.set(true);
    forkJoin({
      perfil: this.perfilService.obterPerfil(),
      enderecos: this.enderecoApi.listar(0, 100),
    }).subscribe({
      next: ({ perfil, enderecos }) => {
        if (!perfil.nomeCompleto?.trim() || !perfil.cpf?.trim()) {
          this.erro.set('Complete seu nome e CPF em Minha conta antes de finalizar o pedido.');
          this.carregando.set(false);
          return;
        }
        this.enderecos.set(enderecos.items);
        const principal = enderecos.items.find((endereco) => endereco.principal);
        this.enderecoSelecionado.set(principal?.id ?? enderecos.items[0]?.id ?? null);
        this.etapa.set('endereco');
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.erro.set(this.mensagemErro(error, 'Não foi possível carregar seus dados de entrega.'));
        this.carregando.set(false);
      },
    });
  }

  continuarParaPagamento(): void {
    if (this.enderecoSelecionado() === null) {
      this.erro.set('Selecione um endereço de entrega para continuar.');
      return;
    }
    this.erro.set('');
    this.etapa.set('pagamento');
  }

  selecionarEndereco(enderecoId: number): void {
    this.enderecoSelecionado.set(enderecoId);
    this.erro.set('');
  }

  selecionarMetodo(metodo: MetodoPagamentoCheckout): void {
    this.metodoPagamento.set(metodo);
  }

  criarPedido(): void {
    const enderecoId = this.enderecoSelecionado();
    if (enderecoId === null || this.carregando()) {
      return;
    }

    this.erro.set('');
    this.carregando.set(true);
    this.checkoutApi.finalizar({
      enderecoId,
      itens: this.carrinho.itens().map(({ droneId, quantidade }) => ({ droneId, quantidade })),
      metodoPagamento: this.metodoPagamento(),
    }).subscribe({
      next: (resposta) => {
        this.pedidoFinalizado.set(resposta);
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.erro.set(this.mensagemErro(error, 'Não foi possível criar o pedido. Confira o estoque e tente novamente.'));
        this.carregando.set(false);
      },
    });
  }

  simularPagamento(): void {
    const pedido = this.pedidoFinalizado();
    if (!pedido || this.carregando()) {
      return;
    }

    this.erro.set('');
    this.carregando.set(true);
    this.checkoutApi.simularAprovacao(pedido.metodoPagamento, pedido.pagamentoId).subscribe({
      next: () => {
        this.carrinho.limpar();
        this.etapa.set('concluido');
        this.carregando.set(false);
      },
      error: (error: unknown) => {
        this.erro.set(this.mensagemErro(error, 'Não foi possível concluir a simulação de pagamento.'));
        this.carregando.set(false);
      },
    });
  }

  voltarParaEndereco(): void {
    this.pedidoFinalizado.set(null);
    this.erro.set('');
    this.etapa.set('endereco');
  }

  private mensagemErro(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const mensagem = error.error?.error?.message ?? error.error?.message;
      if (typeof mensagem === 'string' && mensagem.trim()) {
        return mensagem;
      }
      if (error.status === 401) {
        return 'Sua sessão expirou. Entre novamente para continuar.';
      }
    }
    return fallback;
  }
}
