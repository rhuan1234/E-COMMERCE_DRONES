import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  viewChildren,
} from '@angular/core';
import { movimentoReduzido } from '../../motion/motion-tokens';

interface RotorSpec {
  id: string;
  /** Coordenada X do eixo do motor em % da largura da imagem do corpo. */
  x: number;
  /** Coordenada Y do topo do eixo do motor em % da altura da imagem do corpo. */
  y: number;
  /** Diâmetro do rotor em % da largura do corpo (respeita perspectiva de profundidade). */
  diametro: number;
  /** Inclinação do plano do rotor em graus (alinha com o plano do braço na câmera). */
  inclinacaoZ: number;
  /** Compressão vertical da elipse de perspectiva (cos(72.3°) ≈ 0.305). */
  escalaY: number;
  /** Sentido real de rotação de quadricóptero (+1 horário, -1 anti-horário). */
  sentido: 1 | -1;
  /** Ângulo inicial em graus para que as 4 pás nunca fiquem artificialmente paralelas. */
  anguloInicial: number;
}

/**
 * Coordenadas medidas diretamente sobre `public/landing/drone-3d-body.webp` (880×459)
 * para alinhar os 4 eixos de rotação ao pixel exato dos motores.
 */
const ROTORES: readonly RotorSpec[] = [
  { id: 'rl', x: 38.0, y: 4.5, diametro: 39, inclinacaoZ: -2.5, escalaY: 0.305, sentido: 1, anguloInicial: 24 },
  { id: 'rr', x: 95.8, y: 24.4, diametro: 42, inclinacaoZ: 2.0, escalaY: 0.305, sentido: -1, anguloInicial: 112 },
  { id: 'fl', x: 5.4, y: 29.0, diametro: 47, inclinacaoZ: -3.5, escalaY: 0.31, sentido: -1, anguloInicial: 68 },
  { id: 'fr', x: 79.8, y: 53.8, diametro: 52, inclinacaoZ: 3.0, escalaY: 0.315, sentido: 1, anguloInicial: 152 },
];

let proximoRigId = 0;

/**
 * Rig 3D leve do drone Skyline (WebP transparente de 38 KB + 4 rotores animados em perspectiva 3D).
 *
 * - Modo `'pronto'`: motores em marcha lenta visível no chão + LEDs de navegação pulsando.
 * - Modo `'voo'`: rotação, blur aerodinâmico e brilho dos LEDs controlados em 60fps via `atualizarVoo(...)`,
 *   sem disparar change detection do Angular.
 * - Modo `'estatico'`: fallback sem loop de animação (ex.: card de ficha).
 */
@Component({
  selector: 'app-drone-3d-rig',
  standalone: true,
  styleUrl: './drone-3d-rig.css',
  template: `
    <div class="rig-pad" [class.rig-em-voo]="modo() === 'voo'">
      <div class="rig-palco">
        <img
          class="rig-corpo"
          src="/landing/drone-3d-body.webp"
          [alt]="alt()"
          width="880"
          height="459"
          [attr.fetchpriority]="prioridadeAlta() ? 'high' : null"
          [attr.loading]="prioridadeAlta() ? null : 'lazy'"
          decoding="async">

        <!-- LEDs de navegação ativos nos braços dianteiros -->
        <span class="rig-led rig-led-fl" aria-hidden="true"></span>
        <span class="rig-led rig-led-fr" aria-hidden="true"></span>

        <!-- 4 rotores independentes projetados no plano 3D exato dos motores -->
        @for (rotor of rotores; track rotor.id) {
          <div
            class="rig-rotor-ancora"
            [style.left.%]="rotor.x"
            [style.top.%]="rotor.y"
            [style.width.%]="rotor.diametro"
            aria-hidden="true">
            <div
              class="rig-rotor-plano"
              [style.transform]="'rotate(' + rotor.inclinacaoZ + 'deg) scaleY(' + rotor.escalaY + ')'">
              <!-- Disco aerodinâmico translúcido (ganha opacidade em alta rotação) -->
              <div #discoEl class="rig-rotor-disco"></div>

              <!-- Pás com motion blur em alta rotação -->
              <div #blurEl class="rig-rotor-blur" [style.transform]="'rotate(' + rotor.anguloInicial + 'deg)'">
                <svg class="rig-svg" viewBox="-100 -100 200 200">
                  <defs>
                    <linearGradient [attr.id]="'blur-g-' + uid + '-' + rotor.id" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#1b221e" stop-opacity="0" />
                      <stop offset="22%" stop-color="#1b221e" stop-opacity="0.52" />
                      <stop offset="50%" stop-color="#3c4841" stop-opacity="0.72" />
                      <stop offset="78%" stop-color="#1b221e" stop-opacity="0.52" />
                      <stop offset="100%" stop-color="#1b221e" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M-96,-11 C-58,-22 -22,-15 0,-7 C22,-15 58,-22 96,-11 C99,-4 99,4 96,11 C58,22 22,15 0,7 C-22,15 -58,22 -96,11 C-99,4 -99,-4 -96,-11 Z" [attr.fill]="'url(#blur-g-' + uid + '-' + rotor.id + ')'" />
                  <path d="M-92,-7 C-52,-14 -18,-9 0,-4 C18,-9 52,-14 92,-7 C94,-2 94,2 92,7 C52,14 18,9 0,4 C-18,9 -52,14 -92,7 C-94,2 -94,-2 -92,-7 Z" fill="#cfd8d1" fill-opacity="0.18" transform="rotate(24)" />
                  <path d="M-92,-7 C-52,-14 -18,-9 0,-4 C18,-9 52,-14 92,-7 C94,-2 94,2 92,7 C52,14 18,9 0,4 C-18,9 -52,14 -92,7 C-94,2 -94,-2 -92,-7 Z" fill="#17211b" fill-opacity="0.28" transform="rotate(-24)" />
                </svg>
              </div>

              <!-- Pás reais de fibra de carbono (nítidas em baixa rotação, suavizadas em alta) -->
              <div #paEl class="rig-rotor-pa" [style.transform]="'rotate(' + rotor.anguloInicial + 'deg)'">
                <svg class="rig-svg" viewBox="-100 -100 200 200">
                  <defs>
                    <linearGradient [attr.id]="'blade-a-' + uid + '-' + rotor.id" x1="0%" y1="0%" x2="100%" y2="20%">
                      <stop offset="0%" stop-color="#1f2723" />
                      <stop offset="42%" stop-color="#3c4640" />
                      <stop offset="86%" stop-color="#222a26" />
                      <stop offset="100%" stop-color="#8cc63f" stop-opacity="0.65" />
                    </linearGradient>
                    <linearGradient [attr.id]="'blade-b-' + uid + '-' + rotor.id" x1="100%" y1="100%" x2="0%" y2="80%">
                      <stop offset="0%" stop-color="#1b221e" />
                      <stop offset="48%" stop-color="#333d37" />
                      <stop offset="88%" stop-color="#1f2723" />
                      <stop offset="100%" stop-color="#8cc63f" stop-opacity="0.65" />
                    </linearGradient>
                  </defs>
                  <!-- Pá esquerda -->
                  <path
                    d="M-8,-4.5 C-28,-11 -62,-12 -94,-5.5 C-98,-4.5 -99,-1 -97,2.5 C-94,6.5 -76,8.5 -52,8 C-30,7.5 -15,5 -8,4.2 Z"
                    [attr.fill]="'url(#blade-b-' + uid + '-' + rotor.id + ')'" />
                  <!-- Reflexo na borda de ataque da pá esquerda -->
                  <path
                    d="M-12,-4.2 C-34,-9.5 -64,-10.2 -92,-4.8"
                    fill="none"
                    stroke="#dce6df"
                    stroke-opacity="0.34"
                    stroke-width="1.6"
                    stroke-linecap="round" />
                  <!-- Pá direita -->
                  <path
                    d="M8,4.5 C28,11 62,12 94,5.5 C98,4.5 99,1 97,-2.5 C94,-6.5 76,-8.5 52,-8 C30,-7.5 15,-5 8,-4.2 Z"
                    [attr.fill]="'url(#blade-a-' + uid + '-' + rotor.id + ')'" />
                  <!-- Reflexo na borda de ataque da pá direita -->
                  <path
                    d="M12,4.2 C34,9.5 64,10.2 92,4.8"
                    fill="none"
                    stroke="#dce6df"
                    stroke-opacity="0.34"
                    stroke-width="1.6"
                    stroke-linecap="round" />
                </svg>
              </div>
            </div>

            <!-- Porca metálica central fixa sobre o eixo do motor -->
            <span class="rig-hub-cap"></span>
          </div>
        }
      </div>
    </div>
  `,
})
export class Drone3dRigComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly uid = ++proximoRigId;
  readonly modo = input<'pronto' | 'voo' | 'estatico'>('pronto');
  readonly alt = input('');
  readonly prioridadeAlta = input(false);

  readonly rotores = ROTORES;

  private readonly pasEls = viewChildren<ElementRef<HTMLElement>>('paEl');
  private readonly blurEls = viewChildren<ElementRef<HTMLElement>>('blurEl');
  private readonly discoEls = viewChildren<ElementRef<HTMLElement>>('discoEl');

  private readonly angulos = ROTORES.map((r) => r.anguloInicial);
  private readonly angulosDisco = ROTORES.map((r) => r.anguloInicial * 0.5);
  private rpmSuave = 0;

  constructor() {
    afterNextRender(() => this.iniciarLoopProprio());
  }

  /**
   * Atualiza os 4 rotores diretamente no DOM (chamado a 60fps pela cena de decolagem).
   * @param potencia 0 (parado) a 1 (rotação máxima de voo)
   * @param impulsoRolagem aceleração extra vinda da velocidade da rolagem (0..1)
   */
  atualizarVoo(potencia: number, impulsoRolagem = 0): void {
    const win = this.doc.defaultView;
    if (!win || movimentoReduzido(win)) return;

    const alvo = Math.max(0, Math.min(1.4, potencia + impulsoRolagem * 0.55));
    // Inércia real do motor: acelera firme ao ligar e desacelera suavemente
    this.rpmSuave += (alvo - this.rpmSuave) * 0.12;
    this.aplicarQuadro(this.rpmSuave);
  }

  private iniciarLoopProprio(): void {
    if (this.modo() !== 'pronto') return;
    const win = this.doc.defaultView;
    if (!win || movimentoReduzido(win)) return;

    // No chão ("ALT 000 m · pronto"), os motores giram em marcha lenta viva e visível
    let quadro = 0;
    let ultimoTempo = performance.now();

    const loop = (agora: number) => {
      const dt = Math.min((agora - ultimoTempo) / 16.667, 2.5);
      ultimoTempo = agora;
      // Marcha lenta suave (~4.8°/frame): dá para ver cada pá de carbono girando nitidamente
      this.aplicarQuadro(0.14, dt);
      quadro = win.requestAnimationFrame(loop);
    };

    quadro = win.requestAnimationFrame(loop);
    this.destroyRef.onDestroy(() => win.cancelAnimationFrame(quadro));
  }

  private aplicarQuadro(rpm: number, dt = 1): void {
    const pas = this.pasEls();
    const blurs = this.blurEls();
    const discos = this.discoEls();
    if (!pas.length) return;

    // Velocidade angular em graus por frame: marcha lenta (~5°/f) até voo rápido (~44°/f)
    const passoGraus = rpm * 34 * dt;
    const passoDisco = (3 + rpm * 14) * dt;

    // Cross-fade aerodinâmico: em baixa RPM as pás nítidas dominam; em alta RPM viram blur + disco
    const fatorBlur = Math.max(0, Math.min(1, (rpm - 0.18) / 0.65));
    const opacidadePa = Math.max(0.28, 0.96 - fatorBlur * 0.64);
    const opacidadeBlur = fatorBlur * 0.88;
    const opacidadeDisco = Math.max(0.04, fatorBlur * 0.78);

    for (let i = 0; i < ROTORES.length; i++) {
      const sentido = ROTORES[i].sentido;
      this.angulos[i] = (this.angulos[i] + sentido * passoGraus) % 360;
      this.angulosDisco[i] = (this.angulosDisco[i] + sentido * passoDisco) % 360;

      const pa = pas[i]?.nativeElement;
      if (pa) {
        pa.style.transform = `rotate(${this.angulos[i].toFixed(1)}deg)`;
        pa.style.opacity = opacidadePa.toFixed(2);
      }

      const blur = blurs[i]?.nativeElement;
      if (blur) {
        blur.style.transform = `rotate(${(this.angulos[i] - sentido * 16).toFixed(1)}deg)`;
        blur.style.opacity = opacidadeBlur.toFixed(2);
      }

      const disco = discos[i]?.nativeElement;
      if (disco) {
        disco.style.transform = `rotate(${this.angulosDisco[i].toFixed(1)}deg)`;
        disco.style.opacity = opacidadeDisco.toFixed(2);
      }
    }
  }
}
