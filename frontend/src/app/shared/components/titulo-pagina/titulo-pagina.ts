import { Component, input } from '@angular/core';

/**
 * Cabeçalho padrão das páginas da loja, na tipografia da landing:
 * rótulo em JetBrains Mono, título em Archivo larga e descrição curta.
 *
 * - `titulo` simples por input, ou conteúdo próprio projetado com o atributo `titulo`
 *   (ex.: título que muda conforme a etapa);
 * - ações (botões/links) projetadas com o atributo `acoes`;
 * - o restante do conteúdo projetado entra abaixo da descrição.
 */
@Component({
  selector: 'app-titulo-pagina',
  template: `
    <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
      <div class="min-w-0 max-w-[720px]">
        @if (rotulo()) {
          <p class="m-0 font-data text-[13px] font-semibold uppercase tracking-[0.12em] text-leaf">{{ rotulo() }}</p>
        }
        <h1 class="m-0 mt-2.5 font-display font-wide text-[32px] font-extrabold leading-[1.04] tracking-[-0.8px] text-ink md:text-[44px]" [attr.id]="idTitulo() || null">{{ titulo() }}<ng-content select="[titulo]"></ng-content></h1>
        @if (descricao()) {
          <p class="m-0 mt-3 max-w-[38rem] text-[17px] leading-relaxed text-muted">{{ descricao() }}</p>
        }
        <ng-content></ng-content>
      </div>
      <div class="flex flex-wrap gap-2 empty:hidden">
        <ng-content select="[acoes]"></ng-content>
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class TituloPagina {
  readonly rotulo = input('');
  readonly titulo = input('');
  readonly descricao = input('');
  readonly idTitulo = input('');
}
