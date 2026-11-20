/**
 * Tokens de movimento da Skyline Drones.
 *
 * Centraliza easings, durações e checagens de ambiente (movimento reduzido e tipo de ponteiro)
 * para manter todas as animações com a mesma física e sem quebrar em SSR/JSDOM.
 */

export const MOTION_EASE = {
  entrada: 'expo.out',
  peso: 'power4.out',
  saida: 'power2.inOut',
  selo: 'back.out(1.4)',
} as const;

export const MOTION_DUR = {
  longa: 1.15,
  media: 0.78,
  curta: 0.45,
} as const;

export const MOTION_STAGGER = {
  linha: 0.08,
  card: 0.055,
} as const;

/**
 * Retorna true quando o usuário prefere movimento reduzido ou o ambiente não suporta
 * media queries / requestAnimationFrame (ex.: SSR ou testes em JSDOM).
 */
export function movimentoReduzido(win: Window | null | undefined): boolean {
  if (!win || typeof win.matchMedia !== 'function' || typeof win.requestAnimationFrame !== 'function') {
    return true;
  }
  return win.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Retorna true apenas em dispositivos com ponteiro fino e hover real (mouse/trackpad).
 * Evita ativar efeitos de cursor (magnético, tilt 3D, smooth wheel) em telas touch.
 */
export function ponteiroFino(win: Window | null | undefined): boolean {
  if (!win || typeof win.matchMedia !== 'function') {
    return false;
  }
  return win.matchMedia('(hover: hover) and (pointer: fine)').matches;
}
