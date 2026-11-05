import { Injectable, computed, signal } from '@angular/core';

/** Resumo guardado de cada drone escolhido; a ficha completa é buscada na página de comparação. */
export interface ItemComparacao {
  id: number;
  nome: string;
}

export const LIMITE_COMPARACAO = 3;
const CHAVE_ARMAZENAMENTO = 'skyline.comparacao';

/**
 * Seleção de drones para comparar, compartilhada entre catálogo, detalhes e a página /comparar.
 * Fica no sessionStorage para sobreviver à navegação e a um recarregamento da aba.
 */
@Injectable({ providedIn: 'root' })
export class ComparacaoService {
  private readonly selecao = signal<readonly ItemComparacao[]>(this.lerArmazenado());

  readonly itens = this.selecao.asReadonly();
  readonly quantidade = computed(() => this.selecao().length);
  readonly cheia = computed(() => this.selecao().length >= LIMITE_COMPARACAO);
  readonly limite = LIMITE_COMPARACAO;

  contem(id: number): boolean {
    return this.selecao().some((item) => item.id === id);
  }

  /** Adiciona ou remove o drone; devolve false quando a seleção já está cheia. */
  alternar(item: ItemComparacao): boolean {
    if (this.contem(item.id)) {
      this.remover(item.id);
      return true;
    }
    if (this.cheia()) {
      return false;
    }
    this.atualizar([...this.selecao(), { id: item.id, nome: item.nome }]);
    return true;
  }

  remover(id: number): void {
    this.atualizar(this.selecao().filter((item) => item.id !== id));
  }

  limpar(): void {
    this.atualizar([]);
  }

  private atualizar(itens: ItemComparacao[]): void {
    this.selecao.set(itens);
    try {
      sessionStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(itens));
    } catch {
      // Sem armazenamento: a seleção vale só enquanto a página estiver aberta.
    }
  }

  private lerArmazenado(): ItemComparacao[] {
    try {
      const bruto = sessionStorage.getItem(CHAVE_ARMAZENAMENTO);
      const itens: unknown = bruto ? JSON.parse(bruto) : [];
      if (!Array.isArray(itens)) {
        return [];
      }
      return itens
        .filter((item): item is ItemComparacao =>
          typeof item?.id === 'number' && typeof item?.nome === 'string')
        .slice(0, LIMITE_COMPARACAO);
    } catch {
      return [];
    }
  }
}
