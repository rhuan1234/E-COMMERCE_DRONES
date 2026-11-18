import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DroneMarkComponent } from '../../../shared/components/drone-mark/drone-mark';

/**
 * Moldura das telas de autenticação, na linguagem da landing "primeiro voo":
 * foto da paisagem com a frase da etapa à esquerda (no celular, uma faixa no topo)
 * e o formulário projetado no conteúdo à direita.
 */
@Component({
  imports: [DroneMarkComponent, RouterLink],
  selector: 'app-auth-shell',
  template: `
    <div class="grid min-h-dvh bg-paper font-body text-ink antialiased lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <!-- Painel da paisagem: decorativo, o texto real está no formulário -->
      <aside class="auth-paisagem relative isolate flex min-h-[220px] flex-col justify-between overflow-hidden bg-night p-5 text-paper sm:min-h-[260px] md:p-8 lg:sticky lg:top-0 lg:h-dvh lg:p-12">
        <img class="absolute inset-0 -z-20 size-full object-cover" [src]="foto()" alt="" (error)="esconder($event)">
        <a class="relative inline-flex w-fit items-center gap-3 rounded-xl text-paper no-underline" routerLink="/" aria-label="Skyline Drones - página inicial">
          <span class="grid size-11 place-items-center rounded-[13px] bg-ink text-lime-glow" aria-hidden="true">
            <app-drone-mark class="w-[26px]"></app-drone-mark>
          </span>
          <span class="auth-sombra flex flex-col leading-none">
            <span class="font-display font-extra-wide text-[17px] font-extrabold tracking-[1.6px]">SKYLINE</span>
            <span class="font-display font-extra-wide mt-1 text-[11px] font-bold tracking-[3.6px] text-lime-glow">DRONES</span>
          </span>
        </a>

        <div class="auth-protecao relative max-w-[30rem]" aria-hidden="true">
          <p class="m-0 font-data text-xs font-semibold uppercase tracking-[0.12em] text-lime-glow">{{ altitude() }}</p>
          <p class="m-0 mt-3 hidden font-display font-wide text-[40px] font-extrabold leading-[0.98] tracking-[-1px] sm:block xl:text-[56px]">{{ frase() }}</p>
        </div>
      </aside>

      <main class="flex items-start justify-center px-5 py-10 sm:py-14 lg:items-center lg:px-12 lg:py-16">
        <div class="w-full max-w-[420px]">
          <p class="m-0 font-data text-[13px] font-semibold uppercase tracking-[0.12em] text-leaf">{{ rotulo() }}</p>
          <h1 class="m-0 mt-3 font-display font-wide text-[34px] font-extrabold leading-[1.02] tracking-[-0.8px] sm:text-[42px]">{{ titulo() }}</h1>
          <p class="m-0 mt-3 text-[17px] leading-relaxed text-muted">{{ subtitulo() }}</p>
          <div class="mt-9">
            <ng-content></ng-content>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    /* Degradê sutil no topo garante contraste do wordmark sobre céus claros */
    .auth-paisagem::before {
      content: '';
      position: absolute;
      inset: 0 0 auto 0;
      height: 190px;
      z-index: -1;
      background: linear-gradient(to bottom, rgb(18 26 21 / 0.88), rgb(18 26 21 / 0.35) 60%, rgb(18 26 21 / 0));
      pointer-events: none;
    }

    /* Sombra só atrás do texto sobre a foto, nunca uma manta sobre a tela inteira */
    .auth-protecao::before {
      content: '';
      position: absolute;
      inset: -64px -96px -48px -96px;
      z-index: -1;
      background: radial-gradient(closest-side, rgb(18 26 21 / 0.78), rgb(18 26 21 / 0));
    }

    .auth-sombra {
      text-shadow: 0 1px 12px rgb(18 26 21 / 0.72);
    }

    a:focus-visible {
      outline: 3px solid var(--color-lime);
      outline-offset: 3px;
    }
  `,
})
export class AuthShell {
  readonly foto = input('/landing/aerea.webp');
  readonly altitude = input('ALT 000 m · pronto');
  readonly frase = input('');
  readonly rotulo = input('');
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');

  esconder(evento: Event): void {
    (evento.target as HTMLElement).hidden = true;
  }
}
