import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MagneticDirective } from './magnetic.directive';
import { MOTION_DUR, MOTION_EASE, movimentoReduzido, ponteiroFino } from './motion-tokens';
import { TiltDirective } from './tilt.directive';

@Component({
  imports: [MagneticDirective, TiltDirective],
  template: `
    <button type="button" class="cta" appMagnetic [magneticMax]="4">Explorar</button>
    <div class="card" appTilt [tiltMaxX]="4" [tiltMaxY]="6">
      <span class="tilt-glare"></span>
    </div>
  `,
})
class MotionHost {}

describe('Motion utilities and directives', () => {
  it('exposes consistent motion tokens', () => {
    expect(MOTION_EASE.entrada).toBe('expo.out');
    expect(MOTION_DUR.media).toBeGreaterThan(MOTION_DUR.curta);
  });

  it('treats missing matchMedia (JSDOM/SSR) as reduced motion and non-fine pointer', () => {
    expect(movimentoReduzido(null)).toBe(true);
    expect(ponteiroFino(null)).toBe(false);
    expect(movimentoReduzido({} as Window)).toBe(true);
    expect(ponteiroFino({} as Window)).toBe(false);
  });

  it('mounts appMagnetic and appTilt safely without leaving stray inline styles in reduced-motion environments', async () => {
    await TestBed.configureTestingModule({
      imports: [MotionHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(MotionHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.cta') as HTMLButtonElement;
    const card = fixture.nativeElement.querySelector('.card') as HTMLDivElement;

    expect(button.style.transform).toBe('');
    expect(card.style.transform).toBe('');

    fixture.destroy();
  });
});
