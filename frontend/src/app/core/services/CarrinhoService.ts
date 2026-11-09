import { Injectable, computed, signal } from '@angular/core';
import { ItemCarrinho } from '../models/carrinho/ItemCarrinho';
import { Drone, DroneImagem } from '../models/drone/Drone';

export type ResultadoAdicaoCarrinho =
  | 'adicionado'
  | 'indisponivel'
  | 'limite-estoque'
  | 'produto-invalido';

const CHAVE_ARMAZENAMENTO = 'skyline.carrinho';

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  readonly erroPersistencia = signal('');
  private readonly estado = signal<readonly ItemCarrinho[]>(this.lerArmazenado());

  readonly itens = this.estado.asReadonly();
  readonly quantidadeItens = computed(() =>
    this.estado().reduce((total, item) => total + item.quantidade, 0),
  );
  readonly subtotal = computed(() =>
    this.estado().reduce((total, item) => total + item.preco * item.quantidade, 0),
  );

  adicionar(drone: Drone): ResultadoAdicaoCarrinho {
    if (
      !Number.isInteger(drone.id)
      || drone.id <= 0
      || !drone.nome?.trim()
      || !Number.isFinite(drone.preco)
      || drone.preco <= 0
      || !Number.isInteger(drone.quantidadeDisponivel)
      || drone.quantidadeDisponivel < 0
    ) {
      return 'produto-invalido';
    }
    if (drone.quantidadeDisponivel === 0) {
      return 'indisponivel';
    }

    const atual = this.estado();
    const itemExistente = atual.find((item) => item.droneId === drone.id);
    if (itemExistente && itemExistente.quantidade >= drone.quantidadeDisponivel) {
      return 'limite-estoque';
    }

    const imagem = drone.imagens?.find((item) => item.principal) ?? drone.imagens?.[0] ?? null;
    const itemAtualizado: ItemCarrinho = {
      droneId: drone.id,
      nome: drone.nome,
      preco: drone.preco,
      quantidade: (itemExistente?.quantidade ?? 0) + 1,
      estoqueDisponivel: drone.quantidadeDisponivel,
      imagem: imagem ? { ...imagem } : null,
    };

    this.atualizar(
      itemExistente
        ? atual.map((item) => item.droneId === drone.id ? itemAtualizado : item)
        : [...atual, itemAtualizado],
    );
    return 'adicionado';
  }

  definirQuantidade(droneId: number, quantidade: number): boolean {
    const item = this.estado().find((atual) => atual.droneId === droneId);
    if (
      !item
      || !Number.isInteger(quantidade)
      || quantidade < 1
      || quantidade > item.estoqueDisponivel
    ) {
      return false;
    }

    this.atualizar(this.estado().map((atual) =>
      atual.droneId === droneId ? { ...atual, quantidade } : atual,
    ));
    return true;
  }

  remover(droneId: number): void {
    this.atualizar(this.estado().filter((item) => item.droneId !== droneId));
  }

  private atualizar(itens: readonly ItemCarrinho[]): void {
    this.estado.set(itens);
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(itens));
      this.erroPersistencia.set('');
    } catch (error: unknown) {
      console.error('Não foi possível persistir o carrinho no armazenamento local:', error);
      this.erroPersistencia.set('O carrinho está disponível nesta sessão, mas não pôde ser salvo neste navegador.');
    }
  }

  private lerArmazenado(): ItemCarrinho[] {
    try {
      const conteudo = localStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (!conteudo) {
        return [];
      }

      const dados: unknown = JSON.parse(conteudo);
      if (!Array.isArray(dados) || !dados.every(ehItemCarrinho)) {
        throw new Error('Formato de carrinho armazenado inválido.');
      }
      return dados;
    } catch (error: unknown) {
      console.error('Não foi possível ler o carrinho salvo neste navegador:', error);
      this.erroPersistencia.set('Os dados salvos do carrinho não puderam ser lidos; inicie um novo carrinho.');
      return [];
    }
  }
}

function ehItemCarrinho(valor: unknown): valor is ItemCarrinho {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const item = valor as Record<string, unknown>;
  return Number.isInteger(item['droneId'])
    && typeof item['nome'] === 'string'
    && typeof item['preco'] === 'number'
    && Number.isFinite(item['preco'])
    && typeof item['quantidade'] === 'number'
    && Number.isInteger(item['quantidade'])
    && item['quantidade'] > 0
    && typeof item['estoqueDisponivel'] === 'number'
    && Number.isInteger(item['estoqueDisponivel'])
    && item['estoqueDisponivel'] >= item['quantidade']
    && imagemValida(item['imagem']);
}

function imagemValida(valor: unknown): valor is DroneImagem | null {
  if (valor === null) {
    return true;
  }
  if (typeof valor !== 'object') {
    return false;
  }
  const imagem = valor as Record<string, unknown>;
  return Number.isInteger(imagem['id'])
    && typeof imagem['caminho'] === 'string'
    && typeof imagem['principal'] === 'boolean'
    && Number.isInteger(imagem['ordem']);
}
