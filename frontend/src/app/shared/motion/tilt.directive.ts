import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { movimentoReduzido, ponteiroFino } from './motion-tokens';

/**
 * Inclinação 3D contida com física de mola e reflexo especular opcional (`.tilt-glare`).
 * Dorme automaticamente quando em repouso (0% CPU ociosa) e nunca ativa em telas touch
 * ou quando `prefers-reduced-motion: reduce` está ativo.
 */
@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  /** Inclinação máxima em graus no eixo X (vertical). */
  readonly tiltMaxX = input(5);
  /** Inclinação máxima em graus no eixo Y (horizontal). */
  readonly tiltMaxY = input(7);
  /** Perspectiva CSS em pixels. */
  readonly tiltPerspective = input(960);

  constructor() {
    afterNextRender(() => this.iniciar());
  }

  private iniciar(): void {
    const win = this.doc.defaultView;
    if (!win || movimentoReduzido(win) || !ponteiroFino(win)) {
      return;
    }

    const el = this.host;
    let rx = 0;
    let ry = 0;
    let trx = 0;
    let try_ = 0;
    let vrx = 0;
    let vry = 0;
    let glareX = 0;
    let glareO = 0;
    let targetGlareX = 0;
    let targetGlareO = 0;
    let quadro = 0;

    const stiffness = 0.14;
    const damping = 0.74;

    const animar = () => {
      vrx = (vrx + (trx - rx) * stiffness) * damping;
      vry = (vry + (try_ - ry) * stiffness) * damping;
      rx += vrx;
      ry += vry;
      glareX += (targetGlareX - glareX) * 0.18;
      glareO += (targetGlareO - glareO) * 0.16;

      const glareEl = el.querySelector<HTMLElement>('.tilt-glare');

      const parado =
        Math.abs(trx - rx) < 0.03
        && Math.abs(try_ - ry) < 0.03
        && Math.abs(vrx) < 0.03
        && Math.abs(vry) < 0.03
        && Math.abs(targetGlareO - glareO) < 0.005;

      if (parado) {
        rx = trx;
        ry = try_;
        glareX = targetGlareX;
        glareO = targetGlareO;
        quadro = 0;

        if (rx === 0 && ry === 0) {
          el.style.transform = '';
          el.style.willChange = '';
        } else {
          el.style.transform = `perspective(${this.tiltPerspective()}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        }
        if (glareEl) {
          glareEl.style.opacity = glareO.toFixed(3);
          glareEl.style.transform = `translate3d(${glareX.toFixed(1)}%, 0, 0)`;
        }
        return;
      }

      el.style.transform = `perspective(${this.tiltPerspective()}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      if (glareEl) {
        glareEl.style.opacity = glareO.toFixed(3);
        glareEl.style.transform = `translate3d(${glareX.toFixed(1)}%, 0, 0)`;
      }
      quadro = win.requestAnimationFrame(animar);
    };

    const acordar = () => {
      if (!quadro) {
        el.style.willChange = 'transform';
        quadro = win.requestAnimationFrame(animar);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      try_ = nx * this.tiltMaxY();
      trx = -ny * this.tiltMaxX();
      targetGlareX = nx * 24;
      targetGlareO = 0.85;
      acordar();
    };

    const onLeave = () => {
      trx = 0;
      try_ = 0;
      targetGlareX = 0;
      targetGlareO = 0;
      acordar();
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);

    this.destroyRef.onDestroy(() => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (quadro) {
        win.cancelAnimationFrame(quadro);
      }
      el.style.transform = '';
      el.style.willChange = '';
      const glareEl = el.querySelector<HTMLElement>('.tilt-glare');
      if (glareEl) {
        glareEl.style.opacity = '';
        glareEl.style.transform = '';
      }
    });
  }
}
