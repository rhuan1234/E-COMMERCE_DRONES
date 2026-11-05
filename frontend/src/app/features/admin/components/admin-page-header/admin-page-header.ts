import { Component, input } from '@angular/core';

/**
 * Cabeçalho padrão das telas do painel: rótulo da seção, título, descrição
 * opcional e área de ações (botões projetados com o atributo `actions`).
 */
@Component({
  selector: 'app-admin-page-header',
  standalone: true,
  template: `
    <header class="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 lg:mb-8">
      <div class="min-w-0">
        <p class="m-0 font-data text-xs font-semibold uppercase tracking-[2px] text-leaf">{{ secao() }}</p>
        <h1 class="m-0 mt-2 font-display font-wide text-[26px] font-extrabold leading-tight tracking-[-0.4px] text-ink md:text-[32px]">
          {{ titulo() }}
        </h1>
        @if (descricao()) {
          <p class="m-0 mt-2 max-w-[62ch] text-[15px] leading-relaxed text-muted">{{ descricao() }}</p>
        }
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <ng-content select="[actions]"></ng-content>
      </div>
    </header>
  `,
})
export class AdminPageHeader {
  readonly secao = input.required<string>();
  readonly titulo = input.required<string>();
  readonly descricao = input<string>('');
}
