import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ItemCarrinho } from '../../../../core/models/carrinho/ItemCarrinho';
import { CarrinhoService } from '../../../../core/services/CarrinhoService';
import { DroneImagem } from '../../../../core/models/drone/Drone';
import { DroneService } from '../../../../core/services/DroneService';

@Component({
  imports: [MatIconModule, RouterLink],
  selector: 'app-carrinho',
  templateUrl: './carrinho.html',
})
export class Carrinho {
  readonly carrinho = inject(CarrinhoService);
  private readonly droneService = inject(DroneService);
  private readonly moeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  formatarPreco(valor: number): string {
    return this.moeda.format(valor);
  }

  obterUrlImagem(imagem: DroneImagem): string {
    return this.droneService.obterUrlImagem(imagem);
  }

  alterarQuantidade(item: ItemCarrinho, quantidade: number): void {
    this.carrinho.definirQuantidade(item.droneId, quantidade);
  }

  remover(item: ItemCarrinho): void {
    this.carrinho.remover(item.droneId);
  }
}
