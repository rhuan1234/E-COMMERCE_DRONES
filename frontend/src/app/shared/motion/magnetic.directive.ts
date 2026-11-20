import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { movimentoReduzido, ponteiroFino } from './motion-tokens';

/**
 * Botão magnético contido (zero dependências externas):
 * dentro de um raio em volta do elemento, ele se inclina sutilmente (até `magneticMax` px)
 * na direção do cursor com física de mola e dorme automaticamente quando em repouso (0% CPU ociosa).
 *
 * Desligado automaticamente em dispositivos touch, `prefers-reduced-motion` e JSDOM.
 */
@Directive({
  selector: '[appMagnetic]',
  standalone: true,
})
export class MagneticDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  /** Deslocamento máximo em pixels por eixo. */
  readonly magneticMax = input(5);
  /** Raio de atração ao redor do elemento em pixels. */
  readonly magneticRadius = input(72);

  constructor() {
    afterNextRender(() => this.iniciar());
  }

  private iniciar(): void {
    const win = this.doc.defaultView;
    if (!win || movimentoReduzido(win) || !ponteiroFino(win)) {
      return;
    }

    const el = this.host;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let scaleAlvo = 1;
    let scale = 1;
    let quadro = 0;
    let ativo = false;

    const stiffness = 0.16;
    const damping = 0.72;

    const animar = () => {
      vx = (vx + (tx - x) * stiffness) * damping;
      vy = (vy + (ty - y) * stiffness) * damping;
      x += vx;
      y += vy;
      scale += (scaleAlvo - scale) * 0.22;

      const parado =
        Math.abs(tx - x) < 0.04
        && Math.abs(ty - y) < 0.04
        && Math.abs(vx) < 0.04
        && Math.abs(vy) < 0.04
        && Math.abs(scaleAlvo - scale) < 0.001;

      if (parado) {
        x = tx;
        y = ty;
        scale = scaleAlvo;
        quadro = 0;
        if (x === 0 && y === 0 && scale === 1) {
          el.style.transform = '';
          el.style.willChange = '';
        } else {
          el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        }
        return;
      }

      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
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
      if ((el as HTMLButtonElement).disabled) {
        if (ativo) {
          ativo = false;
          tx = 0;
          ty = 0;
          scaleAlvo = 1;
          acordar();
        }
        return;
      }

      const max = this.magneticMax();
      const radius = this.magneticRadius();
      const r = el.getBoundingClientRect();
      // Remove deslocamento atual para que o centro de referência não fuja com o botão.
      const left = r.left - x;
      const top = r.top - y;
      const width = r.width / (scale || 1);
      const height = r.height / (scale || 1);

      const perto =
        e.clientX > left - radius
        && e.clientX < left + width + radius
        && e.clientY > top - radius
        && e.clientY < top + height + radius;

      if (perto) {
        ativo = true;
        const cx = left + width / 2;
        const cy = top + height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;
        tx = Math.max(-max, Math.min(max, dx));
        ty = Math.max(-max, Math.min(max, dy));
        const sobre =
          e.clientX >= left && e.clientX <= left + width && e.clientY >= top && e.clientY <= top + height;
        scaleAlvo = sobre ? 1.02 : 1;
        acordar();
      } else if (ativo) {
        ativo = false;
        tx = 0;
        ty = 0;
        scaleAlvo = 1;
        acordar();
      }
    };

    const onBlur = () => {
      if (!ativo) return;
      ativo = false;
      tx = 0;
      ty = 0;
      scaleAlvo = 1;
      acordar();
    };

    win.addEventListener('pointermove', onMove, { passive: true });
    win.addEventListener('blur', onBlur);

    this.destroyRef.onDestroy(() => {
      win.removeEventListener('pointermove', onMove);
      win.removeEventListener('blur', onBlur);
      if (quadro) {
        win.cancelAnimationFrame(quadro);
      }
      el.style.transform = '';
      el.style.willChange = '';
    });
  }
}
