import { Component, input } from '@angular/core';

/**
 * Marca e silhueta oficial do quadricóptero Skyline Drones.
 * Substitui ícones genéricos e evita duplicação do SVG entre loja, auth, landing e admin.
 */
@Component({
  selector: 'app-drone-mark',
  template: `
    @if (variante() === 'ilustracao') {
      <svg
        class="drone-svg"
        viewBox="0 0 400 400"
        [attr.role]="rotulo() ? 'img' : null"
        [attr.aria-label]="rotulo() || null"
        [attr.aria-hidden]="rotulo() ? null : 'true'">
        <g stroke="#17211b" stroke-width="14" stroke-linecap="round">
          <line x1="200" y1="200" x2="98" y2="98"></line>
          <line x1="200" y1="200" x2="302" y2="98"></line>
          <line x1="200" y1="200" x2="98" y2="302"></line>
          <line x1="200" y1="200" x2="302" y2="302"></line>
        </g>
        <g class="rotor-disco" fill="#17211b" fill-opacity="0.5" [attr.opacity]="animado() ? 0.08 : 0.12">
          <circle cx="98" cy="98" r="66"></circle>
          <circle cx="302" cy="98" r="66"></circle>
          <circle cx="98" cy="302" r="66"></circle>
          <circle cx="302" cy="302" r="66"></circle>
        </g>
        <g [class.rotor]="animado()" stroke="#17211b" stroke-opacity="0.7" stroke-width="6" stroke-linecap="round">
          <line x1="52" y1="120" x2="144" y2="76"></line>
        </g>
        <g [class.rotor]="animado()" stroke="#17211b" stroke-opacity="0.7" stroke-width="6" stroke-linecap="round">
          <line x1="256" y1="76" x2="348" y2="120"></line>
        </g>
        <g [class.rotor]="animado()" stroke="#17211b" stroke-opacity="0.7" stroke-width="6" stroke-linecap="round">
          <line x1="52" y1="280" x2="144" y2="324"></line>
        </g>
        <g [class.rotor]="animado()" stroke="#17211b" stroke-opacity="0.7" stroke-width="6" stroke-linecap="round">
          <line x1="256" y1="324" x2="348" y2="280"></line>
        </g>
        <g fill="#17211b">
          <circle cx="98" cy="98" r="13"></circle>
          <circle cx="302" cy="98" r="13"></circle>
          <circle cx="98" cy="302" r="13"></circle>
          <circle cx="302" cy="302" r="13"></circle>
        </g>
        <g fill="#b7ee75">
          <circle cx="98" cy="98" r="4"></circle>
          <circle cx="302" cy="98" r="4"></circle>
          <circle cx="98" cy="302" r="4"></circle>
          <circle cx="302" cy="302" r="4"></circle>
        </g>
        <rect x="148" y="132" width="104" height="132" rx="36" fill="#17211b"></rect>
        <rect x="164" y="150" width="72" height="64" rx="22" fill="#2a362e"></rect>
        <rect x="188" y="228" width="24" height="5" rx="2.5" fill="#b7ee75"></rect>
        <rect x="178" y="262" width="44" height="30" rx="10" fill="#2a362e"></rect>
        <circle cx="200" cy="277" r="9" fill="#0e1410" stroke="#b7ee75" stroke-width="2"></circle>
      </svg>
    } @else {
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        [attr.role]="rotulo() ? 'img' : null"
        [attr.aria-label]="rotulo() || null"
        [attr.aria-hidden]="rotulo() ? null : 'true'">
        <circle cx="5" cy="5" r="3"></circle>
        <circle cx="19" cy="5" r="3"></circle>
        <circle cx="5" cy="19" r="3"></circle>
        <circle cx="19" cy="19" r="3"></circle>
        <path d="M7.2 7.2l2.6 2.6M16.8 7.2l-2.6 2.6M7.2 16.8l2.6-2.6M16.8 16.8l-2.6-2.6"></path>
        <rect x="9.5" y="9.5" width="5" height="5" rx="1.6" fill="currentColor" stroke="none"></rect>
      </svg>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .rotor {
      transform-box: fill-box;
      transform-origin: center;
    }
  `,
})
export class DroneMarkComponent {
  readonly variante = input<'logo' | 'ilustracao'>('logo');
  readonly animado = input(false);
  readonly rotulo = input('');
}
