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
    <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div class="min-w-0 max-w-[720px]">
        @if (rotulo()) {
          <p class="m-0 font-data text-xs font-semibold uppercase tracking-[0.12em] text-leaf sm:text-[13px]">{{ rotulo() }}</p>
        }
        <h1 class="m-0 mt-2 font-display font-wide text-[clamp(1.75rem,1.25rem+2.5vw,2.75rem)] font-extrabold leading-[1.06] tracking-[-0.025em] text-ink" [attr.id]="idTitulo() || null">{{ titulo() }}<ng-content select="[titulo]"></ng-content></h1>
        @if (descricao()) {
          <p class="m-0 mt-2.5 max-w-[38rem] text-[15px] leading-relaxed text-muted sm:mt-3 sm:text-[17px]">{{ descricao() }}</p>
        }
        <ng-content></ng-content>
      </div>
      <div class="flex w-full flex-wrap gap-2 empty:hidden sm:w-auto">
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
