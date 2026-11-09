/*!
 * Sites Incríveis — motor de rolagem (porte para diretiva Angular)
 * © 2026 Enzo Barbatto — Sparo Automações. Uso conforme LICENCA.md.
 *
 * Porte fiel de `motor/sites-incriveis.js`, com a mesma API de atributos
 * `data-fx-*` e o mesmo CSS (`sites-incriveis.css`). Diferenças do original,
 * todas por causa do ciclo de vida de uma SPA:
 *  - arma-se quando o host é renderizado e se desarma ao ser destruído
 *    (listeners e observers removidos; nada vaza entre navegações);
 *  - observa o DOM do host e arma elementos criados depois (`@if`, dados da API);
 *  - "fundo que viaja" publica `--fx-fundo`/`--fx-tinta` no host, não no <body>;
 *  - cenas fixas descontam o `top` do `.fx-palco` (cabeçalho fixo da loja);
 *  - sem IntersectionObserver/matchMedia (ex.: testes em JSDOM), age como
 *    movimento-reduzido: tudo visível, nada se mexe.
 * Comportamento sob medida da página continua fora daqui.
 */
import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

const REVELACOES = ['surgir', 'subir', 'esquerda', 'direita', 'crescer', 'palavras', 'digitar', 'contar'];
const SELETOR_REVELACOES = REVELACOES.map((nome) => `[data-fx="${nome}"]`).join(',');
const SELETOR_ATORES = '[data-fx-x],[data-fx-y],[data-fx-escala],[data-fx-giro],[data-fx-opacidade]';

type Par = [number, number];

interface Ator {
  el: HTMLElement;
  x: Par | null;
  y: Par | null;
  escala: Par | null;
  giro: Par | null;
  opacidade: Par | null;
  faixa: Par;
}

interface Cena {
  secao: HTMLElement;
  palco: HTMLElement | null;
  atores: Ator[];
  video: HTMLVideoElement | null;
  videoAlvo: number;
  trilho: HTMLElement | null;
  etapas: number;
}

function limitar(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function interpolar(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerPar(texto: string | undefined, padraoA: number, padraoB: number): Par {
  if (!texto) return [padraoA, padraoB];
  const partes = String(texto).split(',');
  let a = parseFloat(partes[0]);
  let b = partes.length > 1 ? parseFloat(partes[1]) : a;
  if (isNaN(a)) a = padraoA;
  if (isNaN(b)) b = padraoB;
  return [a, b];
}

function formatarNumero(valor: number, decimais: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: decimais, maximumFractionDigits: decimais });
}

function progressoNaFaixa(prog: number, faixa: Par): number {
  if (prog <= faixa[0]) return 0;
  if (prog >= faixa[1]) return 1;
  return (prog - faixa[0]) / (faixa[1] - faixa[0]);
}

/**
 * Use no elemento raiz da página: `<div fxScroll>…</div>`. Todos os efeitos
 * `data-fx-*` dentro dele passam a funcionar.
 */
@Directive({ selector: '[fxScroll]' })
export class FxScroll {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly doc = inject(DOCUMENT);

  private reduzido = false;
  private adicionouClasseReduzido = false;
  private readonly armados = new WeakSet<Element>();
  private readonly fundosObservados = new WeakSet<Element>();
  private cenas: Cena[] = [];
  private paralaxes: { el: HTMLElement; forca: number }[] = [];
  private observadorRevelacao?: IntersectionObserver;
  private observadorFundo?: IntersectionObserver;
  private observadorDom?: MutationObserver;
  private agendado = false;
  private quadroVideo = 0;
  private ativo = false;
  private readonly limpezas: (() => void)[] = [];

  constructor() {
    afterNextRender(() => this.iniciar());
    inject(DestroyRef).onDestroy(() => this.parar());
  }

  /* ---------- ciclo de vida ---------- */

  private iniciar(): void {
    const win = this.doc.defaultView;
    if (!win) return;
    const suportado = typeof win.IntersectionObserver === 'function' && typeof win.matchMedia === 'function';
    this.reduzido = !suportado || win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const raiz = this.doc.documentElement;
    if (this.reduzido && !raiz.classList.contains('fx-reduzido')) {
      raiz.classList.add('fx-reduzido');
      this.adicionouClasseReduzido = true;
    }
    this.ativo = true;

    if (suportado && !this.reduzido) {
      this.observadorRevelacao = new IntersectionObserver((entradas) => this.aoRevelar(entradas), {
        threshold: 0.25,
        rootMargin: '0px 0px -8% 0px',
      });
      this.observadorFundo = new IntersectionObserver((entradas) => this.aoTrocarFundo(entradas), {
        rootMargin: '-45% 0px -45% 0px',
      });
    }

    this.armarTudo();
    this.armarMouse();

    if (typeof MutationObserver === 'function') {
      let pendente = false;
      this.observadorDom = new MutationObserver((mudancas) => {
        // Só elementos novos interessam; texto trocado pelo próprio motor (contar/digitar) não.
        const relevante = mudancas.some((m) =>
          Array.from(m.addedNodes).some(
            (n) => n.nodeType === Node.ELEMENT_NODE && !(n as Element).classList.contains('fx-palavra'),
          ),
        );
        if (!relevante || pendente) return;
        pendente = true;
        queueMicrotask(() => {
          pendente = false;
          if (this.ativo) this.armarTudo();
        });
      });
      this.observadorDom.observe(this.host, { childList: true, subtree: true });
    }

    if (!this.reduzido) {
      const aoRolar = () => this.aoRolar();
      win.addEventListener('scroll', aoRolar, { passive: true });
      win.addEventListener('resize', aoRolar);
      this.limpezas.push(() => {
        win.removeEventListener('scroll', aoRolar);
        win.removeEventListener('resize', aoRolar);
      });
      this.aoRolar();
    }
    this.host.classList.add('fx-pronto');
  }

  private parar(): void {
    this.ativo = false;
    this.observadorRevelacao?.disconnect();
    this.observadorFundo?.disconnect();
    this.observadorDom?.disconnect();
    this.limpezas.forEach((limpar) => limpar());
    cancelAnimationFrame(this.quadroVideo);
    if (this.adicionouClasseReduzido) this.doc.documentElement.classList.remove('fx-reduzido');
  }

  /** Arma o que ainda não foi armado (chamado no início e a cada mudança de DOM). */
  private armarTudo(): void {
    this.armarRevelacoes();
    this.armarCenas();
    this.armarFundos();
    this.armarParalaxes();
    if (!this.reduzido) this.aoRolar();
  }

  /* ---------- 1. Revelações ---------- */

  private armarRevelacoes(): void {
    this.host.querySelectorAll<HTMLElement>(SELETOR_REVELACOES).forEach((el) => {
      if (this.armados.has(el)) return;
      this.armados.add(el);
      const tipo = el.dataset['fx'];
      if (tipo === 'palavras') this.prepararPalavras(el);
      if (tipo === 'digitar' && el.dataset['fxTexto'] === undefined) {
        el.dataset['fxTexto'] = el.textContent ?? '';
        el.setAttribute('aria-label', el.dataset['fxTexto']);
        el.textContent = '';
        el.style.minHeight = '1em';
      }
      if (el.dataset['fxAtraso']) el.style.transitionDelay = el.dataset['fxAtraso'] + 'ms';
      if (el.dataset['fxDuracao'] && tipo !== 'palavras' && tipo !== 'digitar' && tipo !== 'contar') {
        el.style.transitionDuration = el.dataset['fxDuracao'] + 'ms';
      }

      if (this.reduzido || !this.observadorRevelacao) {
        el.classList.add('fx-em-cena');
        if (tipo === 'digitar') el.textContent = el.dataset['fxTexto'] ?? '';
        if (tipo === 'contar') el.textContent = this.textoContagem(el, 1);
        return;
      }
      this.observadorRevelacao.observe(el);
    });
  }

  private aoRevelar(entradas: IntersectionObserverEntry[]): void {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const el = entrada.target as HTMLElement;
      this.observadorRevelacao?.unobserve(el);
      const tipo = el.dataset['fx'];
      if (tipo === 'palavras') this.animarPalavras(el);
      el.classList.add('fx-em-cena');
      if (tipo === 'digitar') this.animarDigitar(el);
      if (tipo === 'contar') this.animarContar(el);
    });
  }

  private prepararPalavras(el: HTMLElement): void {
    const texto = el.textContent ?? '';
    el.textContent = '';
    el.setAttribute('aria-label', texto.trim());
    texto.split(/(\s+)/).forEach((pedaco) => {
      if (/^\s+$/.test(pedaco)) {
        el.appendChild(this.doc.createTextNode(pedaco));
      } else if (pedaco) {
        const s = this.doc.createElement('span');
        s.className = 'fx-palavra';
        s.setAttribute('aria-hidden', 'true');
        s.textContent = pedaco;
        el.appendChild(s);
      }
    });
  }

  private animarPalavras(el: HTMLElement): void {
    const palavras = el.querySelectorAll<HTMLElement>('.fx-palavra');
    const passo = parseFloat(el.dataset['fxDuracao'] || '700') / Math.max(palavras.length, 1);
    palavras.forEach((p, i) => (p.style.transitionDelay = Math.round(i * passo) + 'ms'));
  }

  private animarDigitar(el: HTMLElement): void {
    const texto = el.dataset['fxTexto'] ?? '';
    const duracao = parseFloat(el.dataset['fxDuracao'] || '1400');
    let inicio: number | null = null;
    el.classList.add('fx-digitando');
    const quadro = (t: number) => {
      if (!this.ativo) return;
      if (inicio === null) inicio = t;
      const prog = limitar((t - inicio) / duracao, 0, 1);
      el.textContent = texto.slice(0, Math.round(texto.length * prog));
      if (prog < 1) requestAnimationFrame(quadro);
      else el.classList.remove('fx-digitando');
    };
    requestAnimationFrame(quadro);
  }

  private textoContagem(el: HTMLElement, suave: number): string {
    const fim = parseFloat(el.dataset['fxFim'] || el.dataset['fxValor'] || '0');
    const comeco = parseFloat(el.dataset['fxInicio'] || '0');
    const decimais = parseInt(el.dataset['fxDecimais'] || '0', 10);
    return (
      (el.dataset['fxPrefixo'] || '') +
      formatarNumero(interpolar(comeco, fim, suave), decimais) +
      (el.dataset['fxSufixo'] || '')
    );
  }

  private animarContar(el: HTMLElement): void {
    const duracao = parseFloat(el.dataset['fxDuracao'] || '1600');
    let inicio: number | null = null;
    const quadro = (t: number) => {
      if (!this.ativo) return;
      if (inicio === null) inicio = t;
      const prog = limitar((t - inicio) / duracao, 0, 1);
      el.textContent = this.textoContagem(el, 1 - Math.pow(1 - prog, 3));
      if (prog < 1) requestAnimationFrame(quadro);
    };
    requestAnimationFrame(quadro);
  }

  /* ---------- 2. Cenas fixas ---------- */

  private armarCenas(): void {
    const anteriores = new Map(this.cenas.map((c) => [c.secao, c]));
    this.cenas = [];
    this.host.querySelectorAll<HTMLElement>('[data-fx-fixa]').forEach((secao) => {
      const altura = parseFloat(secao.dataset['fxAltura'] || '3');
      secao.style.height = this.reduzido ? 'auto' : altura * 100 + 'vh';

      const atores: Ator[] = [];
      secao.querySelectorAll<HTMLElement>(SELETOR_ATORES).forEach((el) => {
        const d = el.dataset;
        atores.push({
          el,
          x: d['fxX'] !== undefined ? lerPar(d['fxX'], 0, 0) : null,
          y: d['fxY'] !== undefined ? lerPar(d['fxY'], 0, 0) : null,
          escala: d['fxEscala'] !== undefined ? lerPar(d['fxEscala'], 1, 1) : null,
          giro: d['fxGiro'] !== undefined ? lerPar(d['fxGiro'], 0, 0) : null,
          opacidade: d['fxOpacidade'] !== undefined ? lerPar(d['fxOpacidade'], 1, 1) : null,
          faixa: lerPar(d['fxFaixa'], 0, 1),
        });
      });

      const video = secao.querySelector<HTMLVideoElement>('[data-fx="rolar-video"]');
      if (video && !anteriores.has(secao)) {
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.pause();
      }

      const etapas = parseInt(secao.dataset['fxEtapas'] || '0', 10);
      if (this.reduzido && etapas) secao.setAttribute('data-etapa', String(etapas));

      this.cenas.push({
        secao,
        palco: secao.querySelector<HTMLElement>('.fx-palco'),
        atores,
        video,
        videoAlvo: anteriores.get(secao)?.videoAlvo ?? 0,
        trilho: secao.querySelector<HTMLElement>('[data-fx="trilho"]'),
        etapas,
      });
    });

    if (!this.reduzido && !this.quadroVideo && this.cenas.some((c) => c.video)) {
      const laco = () => {
        if (!this.ativo) return;
        this.atualizarVideos();
        this.quadroVideo = requestAnimationFrame(laco);
      };
      this.quadroVideo = requestAnimationFrame(laco);
    }
  }

  private atualizarCena(cena: Cena, alturaTela: number): void {
    const ret = cena.secao.getBoundingClientRect();
    const topoPalco = cena.palco ? parseFloat(getComputedStyle(cena.palco).top) || 0 : 0;
    const percurso = cena.secao.offsetHeight - (alturaTela - topoPalco);
    if (percurso <= 0) return;
    const prog = limitar((topoPalco - ret.top) / percurso, 0, 1);
    cena.secao.style.setProperty('--progresso', prog.toFixed(4));

    cena.atores.forEach((ator) => {
      const p = progressoNaFaixa(prog, ator.faixa);
      let transformar = '';
      if (ator.x) transformar += `translateX(${interpolar(ator.x[0], ator.x[1], p).toFixed(2)}px) `;
      if (ator.y) transformar += `translateY(${interpolar(ator.y[0], ator.y[1], p).toFixed(2)}px) `;
      if (ator.escala) transformar += `scale(${interpolar(ator.escala[0], ator.escala[1], p).toFixed(4)}) `;
      if (ator.giro) transformar += `rotate(${interpolar(ator.giro[0], ator.giro[1], p).toFixed(2)}deg) `;
      if (transformar) ator.el.style.transform = transformar.trim();
      if (ator.opacidade) ator.el.style.opacity = interpolar(ator.opacidade[0], ator.opacidade[1], p).toFixed(3);
    });

    if (cena.video && cena.video.duration) cena.videoAlvo = prog * cena.video.duration;

    if (cena.trilho) {
      const alcance = cena.trilho.scrollWidth - cena.trilho.clientWidth;
      if (alcance > 0) cena.trilho.style.transform = `translateX(${(-prog * alcance).toFixed(1)}px)`;
    }

    if (cena.etapas) {
      const etapa = limitar(Math.floor(prog * cena.etapas) + 1, 1, cena.etapas);
      if (cena.secao.getAttribute('data-etapa') !== String(etapa)) {
        cena.secao.setAttribute('data-etapa', String(etapa));
      }
    }
  }

  private atualizarVideos(): void {
    this.cenas.forEach((cena) => {
      if (!cena.video || !cena.video.duration) return;
      const atual = cena.video.currentTime;
      const delta = cena.videoAlvo - atual;
      if (Math.abs(delta) > 0.01) cena.video.currentTime = atual + delta * 0.35;
    });
  }

  /* ---------- 3. Fundo que viaja ---------- */

  private armarFundos(): void {
    const secoes = this.host.querySelectorAll<HTMLElement>('[data-fx-fundo]');
    if (!secoes.length) return;
    this.host.classList.add('fx-fundo-viaja');
    secoes.forEach((secao) => {
      if (this.fundosObservados.has(secao)) return;
      this.fundosObservados.add(secao);
      this.observadorFundo?.observe(secao);
    });
  }

  private aoTrocarFundo(entradas: IntersectionObserverEntry[]): void {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const alvo = entrada.target as HTMLElement;
      this.host.style.setProperty('--fx-fundo', alvo.dataset['fxFundo'] ?? '');
      if (alvo.dataset['fxTinta']) this.host.style.setProperty('--fx-tinta', alvo.dataset['fxTinta']);
    });
  }

  /* ---------- 4. Paralaxe ---------- */

  private armarParalaxes(): void {
    this.paralaxes = [];
    this.host.querySelectorAll<HTMLElement>('[data-fx-paralaxe]').forEach((el) => {
      if (el.closest('[data-fx-fixa]')) return;
      this.paralaxes.push({ el, forca: parseFloat(el.dataset['fxParalaxe'] ?? '') || 0.2 });
    });
  }

  /* ---------- 5. Ponteiro ---------- */

  private armarMouse(): void {
    const win = this.doc.defaultView;
    if (!win || this.reduzido || !win.matchMedia('(pointer: fine)').matches) return;
    const aoMover = (e: PointerEvent) => {
      const nx = (e.clientX / win.innerWidth) * 2 - 1;
      const ny = (e.clientY / win.innerHeight) * 2 - 1;
      this.host.querySelectorAll<HTMLElement>('[data-fx-mouse]').forEach((el) => {
        const forca = parseFloat(el.dataset['fxMouse'] ?? '') || 10;
        el.style.transform = `translate(${(nx * forca).toFixed(1)}px,${(ny * forca).toFixed(1)}px)`;
      });
    };
    win.addEventListener('pointermove', aoMover, { passive: true });
    this.limpezas.push(() => win.removeEventListener('pointermove', aoMover));
  }

  /* ---------- ciclo principal ---------- */

  private aoRolar(): void {
    if (this.agendado || this.reduzido) return;
    this.agendado = true;
    requestAnimationFrame(() => {
      this.agendado = false;
      if (!this.ativo) return;
      const alturaTela = this.doc.defaultView?.innerHeight ?? 0;
      this.cenas.forEach((cena) => this.atualizarCena(cena, alturaTela));
      const centroTela = alturaTela / 2;
      this.paralaxes.forEach((p) => {
        const ret = p.el.getBoundingClientRect();
        const desvio = (ret.top + ret.height / 2 - centroTela) * -p.forca;
        p.el.style.transform = `translateY(${desvio.toFixed(1)}px)`;
      });
    });
  }
}
