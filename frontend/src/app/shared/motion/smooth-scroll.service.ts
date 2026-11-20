import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { movimentoReduzido, ponteiroFino } from './motion-tokens';

/**
 * Rolagem suave com inércia (Lenis) carregada sob demanda apenas nas páginas
 * que pedem experiência editorial (ex.: landing `/`).
 *
 * - Import dinâmico: adiciona 0 bytes ao bundle inicial da loja.
 * - Desligado automaticamente em dispositivos touch, `prefers-reduced-motion` e JSDOM.
 * - Destruído imediatamente no `DestroyRef` da rota para não afetar catálogo, checkout ou admin.
 */
@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private readonly doc = inject(DOCUMENT);

  iniciar(destroyRef: DestroyRef): void {
    const win = this.doc.defaultView;
    if (!win || movimentoReduzido(win) || !ponteiroFino(win)) {
      return;
    }

    let destruido = false;
    let quadro = 0;
    let instancia: { raf(time: number): void; destroy(): void } | null = null;

    destroyRef.onDestroy(() => {
      destruido = true;
      if (quadro) {
        win.cancelAnimationFrame(quadro);
      }
      instancia?.destroy();
      instancia = null;
    });

    void import('lenis')
      .then(({ default: Lenis }) => {
        if (destruido) return;

        const lenis = new Lenis({
          lerp: 0.085,
          wheelMultiplier: 0.95,
          smoothWheel: true,
        });
        instancia = lenis;

        const loop = (tempo: number) => {
          if (destruido) return;
          lenis.raf(tempo);
          quadro = win.requestAnimationFrame(loop);
        };
        quadro = win.requestAnimationFrame(loop);
      })
      .catch(() => {
        // Falha silenciosa: a página continua perfeitamente navegável com rolagem nativa.
      });
  }
}
