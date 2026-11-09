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
import { FxScroll } from '../../../../shared/fx/fx-scroll';

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

/** Fotos da apresentação (em `public/landing/`). Sem o arquivo, a cena usa cor e desenho. */
const FOTOS_TIPO: Record<string, string> = {
  'primeiro-voo': '/landing/tipo-primeiro-voo.jpg',
  viagem: '/landing/tipo-viagem.jpg',
  cinema: '/landing/tipo-cinema.jpg',
  'longo-alcance': '/landing/tipo-longo-alcance.jpg',
};

interface ValorFicha {
  fim: number;
  decimais: number;
}

/**
 * Página de apresentação da loja (rota raiz): um "primeiro voo" contado pela rolagem.
 * Não lista o catálogo: mostra só o drone em destaque e leva o visitante para `/home`.
 *
 * Efeitos genéricos vêm do motor `FxScroll` (atributos `data-fx-*`). O movimento-assinatura
 * (altímetro de rolagem e hélices que respondem à velocidade) vive aqui.
 */
@Component({
  imports: [FxScroll, MatIconModule, NgTemplateOutlet, RouterLink],
  selector: 'app-landing',
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export class Landing implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly droneService = inject(DroneService);
  private readonly authService = inject(AuthService);
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

  private readonly formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  private readonly formatadorNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

  constructor() {
    afterNextRender(() => this.iniciarAssinatura());
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

  /* ---------- movimento-assinatura: altímetro + hélices ---------- */

  private iniciarAssinatura(): void {
    const win = this.doc.defaultView;
    if (!win) return;

    this.acompanharCabecalho(win);

    const reduzido =
      typeof win.matchMedia !== 'function' || win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const altimetro = this.altimetro()?.nativeElement;
    const valor = altimetro?.querySelector<HTMLElement>('.alt-valor');
    const marcador = altimetro?.querySelector<HTMLElement>('.alt-marcador');
    const rotores = Array.from(this.pico()?.nativeElement.querySelectorAll<SVGGElement>('.rotor') ?? []);
    const discos = Array.from(this.pico()?.nativeElement.querySelectorAll<SVGElement>('.rotor-disco') ?? []);
    const angulos = rotores.map(() => 0);

    let ultimoY = win.scrollY;
    let velocidade = 0;
    let quadro = 0;
    let ultimaAltitude = -1;

    const passo = () => {
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

      if (!reduzido && rotores.length) {
        const y = win.scrollY;
        velocidade = velocidade * 0.9 + Math.abs(y - ultimoY) * 0.1;
        ultimoY = y;
        const progPico = this.progressoPico();
        // Motores ligam no início da decolagem; a rolagem acelera as hélices.
        const marcha = progPico > 0.02 && progPico < 1 ? 9 : progPico >= 1 ? 6 : 0;
        const giro = marcha + Math.min(velocidade * 1.6, 48);
        rotores.forEach((rotor, i) => {
          angulos[i] = (angulos[i] + (i % 2 === 0 ? giro : -giro)) % 360;
          rotor.style.transform = `rotate(${angulos[i].toFixed(1)}deg)`;
        });
        const borrao = Math.min(giro / 40, 1);
        discos.forEach((disco) => (disco.style.opacity = (0.08 + borrao * 0.32).toFixed(2)));
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
