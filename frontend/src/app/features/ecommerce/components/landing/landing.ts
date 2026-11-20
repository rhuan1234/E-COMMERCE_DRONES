import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Drone, DroneImagem } from '../../../../core/models/drone/Drone';
import { TIPOS_DE_VOO } from '../../../../core/models/drone/TipoDeVoo';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { DroneService } from '../../../../core/services/DroneService';
import { Drone3dRigComponent } from '../../../../shared/components/drone-3d-rig/drone-3d-rig';
import { FxScroll } from '../../../../shared/fx/fx-scroll';
import { MagneticDirective } from '../../../../shared/motion/magnetic.directive';
import { MOTION_DUR, MOTION_EASE, MOTION_STAGGER, movimentoReduzido } from '../../../../shared/motion/motion-tokens';
import { SmoothScrollService } from '../../../../shared/motion/smooth-scroll.service';
import { TiltDirective } from '../../../../shared/motion/tilt.directive';

/** Teto de voo recreativo da ANAC (RBAC-E nº 94): 120 m acima do solo. */
const ALTITUDE_MAXIMA = 120;

/**
 * FICTÍCIO: depoimento ilustrativo pedido para o projeto acadêmico.
 * Substituir por uma avaliação real (ou pela futura curadoria do admin) antes de qualquer uso público.
 */
export const DEPOIMENTO_FICTICIO = {
  nome: 'Camila R.',
  contexto: 'comprou o primeiro drone',
  nota: 5,
  texto:
    'Eu achava que drone era coisa de profissional. Comparei três modelos pela autonomia, escolhi o mais leve e, no mesmo fim de semana, já estava filmando a cachoeira da minha cidade.',
} as const;

/** Fotos otimizadas em WebP (em `public/landing/`). Sem o arquivo, a cena usa cor e desenho. */
const FOTOS_TIPO: Record<string, string> = {
  'primeiro-voo': '/landing/tipo-primeiro-voo.webp',
  viagem: '/landing/tipo-viagem.webp',
  cinema: '/landing/tipo-cinema.webp',
  'longo-alcance': '/landing/tipo-longo-alcance.webp',
};

interface ValorFicha {
  fim: number;
  decimais: number;
}

/**
 * Página de apresentação da loja (rota raiz): um "primeiro voo" contado pela rolagem.
 * Não lista o catálogo: mostra só o drone em destaque e leva o visitante para `/home`.
 *
 * Combina o motor leve `FxScroll` com:
 *  - rolagem suave sob demanda (`SmoothScrollService` / Lenis, carregado dinamicamente);
 *  - revelações editoriais sob demanda (`gsap` + `ScrollTrigger` + `SplitText` via import dinâmico);
 *  - movimento-assinatura: altímetro (0 → 120 m) e física de voo do drone 3D em WebP.
 */
@Component({
  imports: [Drone3dRigComponent, FxScroll, MagneticDirective, MatIconModule, NgTemplateOutlet, RouterLink, TiltDirective],
  selector: 'app-landing',
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export class Landing implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly droneService = inject(DroneService);
  private readonly authService = inject(AuthService);
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly doc = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly tiposDeVoo = TIPOS_DE_VOO;
  readonly depoimento = DEPOIMENTO_FICTICIO;
  readonly estrelas = Array.from({ length: DEPOIMENTO_FICTICIO.nota });
  readonly destaque = signal<Drone | null>(null);
  readonly carregandoDestaque = signal(true);
  readonly imagemComFalha = signal(false);

  private readonly pico = viewChild<ElementRef<HTMLElement>>('pico');
  private readonly passos = viewChild<ElementRef<HTMLElement>>('passos');
  private readonly pouso = viewChild<ElementRef<HTMLElement>>('pouso');
  private readonly altimetro = viewChild<ElementRef<HTMLElement>>('altimetro');
  private readonly droneVoo = viewChild<ElementRef<HTMLElement>>('droneVoo');
  private readonly rigVoo = viewChild<Drone3dRigComponent>('rigVoo');
  private readonly droneAura = viewChild<ElementRef<HTMLElement>>('droneAura');
  private readonly droneSombra = viewChild<ElementRef<HTMLElement>>('droneSombra');

  private readonly formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  private readonly formatadorNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

  constructor() {
    afterNextRender(() => {
      this.smoothScroll.iniciar(this.destroyRef);
      this.iniciarAssinatura();
      void this.iniciarMotionEditorial();
    });
  }

  ngOnInit(): void {
    this.droneService
      .findAllEcommerce(0, 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => {
          this.destaque.set(resposta.items?.[0] ?? null);
          this.carregandoDestaque.set(false);
        },
        error: (error: unknown) => {
          // A apresentação continua útil sem o destaque: só a ficha deixa de aparecer.
          console.error('Erro ao carregar o drone em destaque:', error);
          this.carregandoDestaque.set(false);
        },
      });
  }

  get usuarioAutenticado(): boolean {
    return this.authService.isAuthenticated();
  }

  fotoDoTipo(id: string): string | undefined {
    return FOTOS_TIPO[id];
  }

  esconderFoto(evento: Event): void {
    (evento.target as HTMLElement).hidden = true;
  }

  imagemPrincipal(drone: Drone): DroneImagem | undefined {
    return drone.imagens?.find((imagem) => imagem.principal);
  }

  obterUrlImagem(imagem: DroneImagem): string {
    return this.droneService.obterUrlImagem(imagem);
  }

  formatarPreco(valor: number): string {
    return this.formatadorMoeda.format(valor);
  }

  formatarNumero(valor: number | undefined): string {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      return '—';
    }
    return this.formatadorNumero.format(valor);
  }

  formatarAlcance(metros: number | undefined): string {
    if (typeof metros !== 'number' || !Number.isFinite(metros)) {
      return '—';
    }
    return metros >= 1000 ? `${this.formatarNumero(metros / 1000)} km` : `${this.formatarNumero(metros)} m`;
  }

  /** Valor numérico válido da ficha, ou `null` (a linha some em vez de mostrar dado vazio). */
  valorFicha(valor: number | undefined): ValorFicha | null {
    if (typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0) return null;
    return { fim: valor, decimais: Number.isInteger(valor) ? 0 : 1 };
  }

  /** Alcance em km quando passa de 1 km (a leitura humana de "horizonte"). */
  alcanceFicha(metros: number | undefined): (ValorFicha & { unidade: string }) | null {
    const valor = this.valorFicha(metros);
    if (!valor) return null;
    if (valor.fim < 1000) return { ...valor, unidade: 'metros' };
    const km = valor.fim / 1000;
    return { fim: km, decimais: Number.isInteger(km) ? 0 : 1, unidade: 'km' };
  }

  /* ---------- direção de motion editorial (GSAP carregado sob demanda) ---------- */

  private async iniciarMotionEditorial(): Promise<void> {
    const win = this.doc.defaultView;
    if (!win || movimentoReduzido(win)) return;

    let destruido = false;
    let contexto: { revert(): void } | null = null;
    this.destroyRef.onDestroy(() => {
      destruido = true;
      contexto?.revert();
    });

    try {
      const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/SplitText'),
      ]);
      if (destruido) return;

      gsap.registerPlugin(ScrollTrigger, SplitText);

      contexto = gsap.context(() => {
        // 1. Entrada do Hero (estado inicial aplicado só pelo GSAP, nunca oculto no CSS)
        const heroTitle = this.host.querySelector<HTMLElement>('#hero-title');
        if (heroTitle) {
          SplitText.create(heroTitle, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (split) =>
              gsap.from(split.lines, {
                yPercent: 108,
                duration: MOTION_DUR.media,
                ease: MOTION_EASE.entrada,
                stagger: MOTION_STAGGER.linha,
                clearProps: 'transform',
              }),
          });
        }

        const heroDetalhes = this.host.querySelectorAll('.hero-kicker, .hero-lead, .hero-actions');
        if (heroDetalhes.length) {
          gsap.from(heroDetalhes, {
            y: 18,
            opacity: 0,
            duration: MOTION_DUR.curta + 0.2,
            ease: MOTION_EASE.peso,
            stagger: 0.08,
            delay: 0.14,
            clearProps: 'transform,opacity',
          });
        }

        const heroFoto = this.host.querySelector<HTMLElement>('.hero-chao-foto');
        if (heroFoto) {
          gsap.from(heroFoto, {
            scale: 1.09,
            duration: MOTION_DUR.longa,
            ease: MOTION_EASE.peso,
            clearProps: 'transform',
          });
        }

        const heroDrone = this.host.querySelector<HTMLElement>('.hero-drone-wrap');
        if (heroDrone) {
          gsap.from(heroDrone, {
            y: -22,
            opacity: 0,
            duration: MOTION_DUR.longa,
            delay: 0.18,
            ease: MOTION_EASE.entrada,
            clearProps: 'transform,opacity',
          });
        }

        // 2. Títulos das seções revelados por máscara de linhas ao entrar na tela
        const titulos = this.host.querySelectorAll<HTMLElement>('[data-reveal-lines]');
        titulos.forEach((titulo) => {
          SplitText.create(titulo, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (split) =>
              gsap.from(split.lines, {
                yPercent: 110,
                duration: MOTION_DUR.media,
                ease: MOTION_EASE.entrada,
                stagger: MOTION_STAGGER.linha,
                clearProps: 'transform',
                scrollTrigger: {
                  trigger: titulo,
                  start: 'top 88%',
                  once: true,
                },
              }),
          });
        });
      }, this.host);
    } catch {
      // Se o chunk falhar por rede offline, todo conteúdo já está visível no estado final.
    }
  }

  /* ---------- movimento-assinatura: altímetro + física de voo do drone 3D ---------- */

  private iniciarAssinatura(): void {
    const win = this.doc.defaultView;
    if (!win) return;

    this.acompanharCabecalho(win);

    const reduzido = movimentoReduzido(win);
    const altimetro = this.altimetro()?.nativeElement;
    const valor = altimetro?.querySelector<HTMLElement>('.alt-valor');
    const marcador = altimetro?.querySelector<HTMLElement>('.alt-marcador');
    const droneVoo = this.droneVoo()?.nativeElement;
    const droneAura = this.droneAura()?.nativeElement;
    const droneSombra = this.droneSombra()?.nativeElement;

    let ultimoY = win.scrollY;
    let velocidadeSuave = 0;
    let direcaoSuave = 0;
    let quadro = 0;
    let ultimaAltitude = -1;

    const passo = (tempo: number) => {
      const alturaTela = win.innerHeight;
      const altitude = this.calcularAltitude(alturaTela);

      if (altimetro && valor && marcador) {
        const arredondada = Math.round(altitude);
        if (arredondada !== ultimaAltitude) {
          ultimaAltitude = arredondada;
          valor.textContent = String(arredondada).padStart(3, '0');
          marcador.style.transform = `scaleY(${(altitude / ALTITUDE_MAXIMA).toFixed(3)})`;
        }
        // Aparece na decolagem (o chão já mostra "ALT 000 m") e some ao pousar e no rodapé.
        const topoPico = this.pico()?.nativeElement.getBoundingClientRect().top ?? 0;
        const topoPouso = this.pouso()?.nativeElement.getBoundingClientRect().top ?? Infinity;
        altimetro.classList.toggle('alt-oculto', topoPico > alturaTela * 0.5 || topoPouso < alturaTela * 0.35);
      }

      if (!reduzido && droneVoo) {
        const y = win.scrollY;
        const delta = y - ultimoY;
        ultimoY = y;

        velocidadeSuave = velocidadeSuave * 0.88 + Math.min(Math.abs(delta), 60) * 0.12;
        direcaoSuave = direcaoSuave * 0.86 + Math.max(-18, Math.min(18, delta)) * 0.14;

        const progPico = this.progressoPico();
        const emVoo = progPico > 0.02 && progPico < 1.02;

        // Motores ligam na entrada do pico e aceleram dinamicamente conforme a velocidade da rolagem
        const potenciaMotor =
          progPico <= 0.02
            ? 0.08
            : progPico < 1
              ? 0.28 + Math.min(1, progPico * 1.9) * 0.62
              : 0.55;
        const impulsoRolagem = Math.min(1, velocidadeSuave / 20);
        this.rigVoo()?.atualizarVoo(potenciaMotor, impulsoRolagem);

        // Flutuação orgânica contínua + inclinação aerodinâmica respondendo à velocidade da rolagem
        const t = tempo * 0.001;
        const flutuarY = emVoo ? Math.sin(t * 2.4) * 5.5 + Math.cos(t * 1.1) * 2.2 : 0;
        const flutuarX = emVoo ? Math.cos(t * 1.5) * 4.5 : 0;
        const roll = emVoo ? Math.sin(t * 1.6) * 2.2 + direcaoSuave * 0.24 : 0;
        const pitch = emVoo ? Math.max(-10, Math.min(12, direcaoSuave * 0.45 + progPico * 4)) : 0;
        const yaw = emVoo ? Math.cos(t * 1.2) * 2.5 - direcaoSuave * 0.15 : 0;

        droneVoo.style.transform = `perspective(960px) translate3d(${flutuarX.toFixed(2)}px, ${flutuarY.toFixed(2)}px, 0) rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg) rotateZ(${roll.toFixed(2)}deg)`;

        if (droneAura) {
          const empuxo = emVoo ? Math.min(1, 0.28 + velocidadeSuave * 0.045 + progPico * 0.35) : 0;
          droneAura.style.opacity = empuxo.toFixed(2);
          droneAura.style.transform = `scale(${(0.92 + empuxo * 0.24).toFixed(3)})`;
        }

        if (droneSombra) {
          // Quanto maior a altitude na decolagem, mais distante e difusa fica a sombra abaixo do drone
          const fatorAltura = Math.min(1, progPico * 1.25);
          const sombraEscala = 1 - fatorAltura * 0.42;
          const sombraY = fatorAltura * 48;
          const sombraOpacidade = Math.max(0.08, 0.42 - fatorAltura * 0.3);
          droneSombra.style.opacity = sombraOpacidade.toFixed(2);
          droneSombra.style.transform = `translate3d(0, ${sombraY.toFixed(1)}px, 0) scale(${sombraEscala.toFixed(3)})`;
        }
      }
      quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    this.destroyRef.onDestroy(() => cancelAnimationFrame(quadro));
  }

  private progressoPico(): number {
    const pico = this.pico()?.nativeElement;
    if (!pico) return 0;
    return parseFloat(getComputedStyle(pico).getPropertyValue('--progresso')) || 0;
  }

  /**
   * Altitude contada pela rolagem: 0 m no chão, sobe na decolagem até o teto de 120 m,
   * cruza a ficha, os tipos e o depoimento, e desce nos passos da compra até pousar.
   */
  private calcularAltitude(alturaTela: number): number {
    const pico = this.pico()?.nativeElement;
    const passos = this.passos()?.nativeElement;
    const pouso = this.pouso()?.nativeElement;
    if (!pico) return 0;

    const subida = this.faixa(this.progressoPico(), 0.08, 0.92);
    let altitude = ALTITUDE_MAXIMA * (1 - Math.pow(1 - subida, 2));

    if (passos) {
      const ret = passos.getBoundingClientRect();
      const percurso = Math.max(passos.offsetHeight - alturaTela, 1);
      const descida = this.faixa(-ret.top / percurso, 0, 1);
      altitude -= (ALTITUDE_MAXIMA - 40) * descida;
    }
    if (pouso) {
      const ret = pouso.getBoundingClientRect();
      const toque = this.faixa((alturaTela - ret.top) / (alturaTela * 0.8), 0, 1);
      altitude -= 40 * toque;
    }
    return Math.max(0, Math.min(ALTITUDE_MAXIMA, altitude));
  }

  private faixa(valor: number, inicio: number, fim: number): number {
    if (!Number.isFinite(valor) || valor <= inicio) return 0;
    if (valor >= fim) return 1;
    return (valor - inicio) / (fim - inicio);
  }

  /** As cenas fixas param logo abaixo do cabeçalho fixo da loja, qualquer que seja a altura dele. */
  private acompanharCabecalho(win: Window): void {
    const cabecalho = this.doc.querySelector<HTMLElement>('.store-header');
    if (!cabecalho) return;
    const aplicar = () => this.host.style.setProperty('--topo', `${cabecalho.offsetHeight}px`);
    aplicar();
    if (typeof ResizeObserver === 'function') {
      const observador = new ResizeObserver(aplicar);
      observador.observe(cabecalho);
      this.destroyRef.onDestroy(() => observador.disconnect());
    }
  }
}
