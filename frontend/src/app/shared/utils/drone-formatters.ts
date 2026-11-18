import { Drone } from '../../core/models/drone/Drone';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const formatadorNumero = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});

const formatadorPesoKg = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formata valor monetário em BRL (pt-BR). */
export function formatarPreco(valor: number): string {
  return formatadorMoeda.format(valor);
}

/** Formata números inteiros ou decimais curtos em pt-BR. */
export function formatarNumero(valor: number | undefined): string {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    return '—';
  }
  return formatadorNumero.format(valor);
}

/** Formata alcance em metros (`100 m`) ou quilômetros (`20 km`). */
export function formatarAlcance(metros: number | undefined): string {
  if (typeof metros !== 'number' || !Number.isFinite(metros)) {
    return '—';
  }
  return metros >= 1000
    ? `${formatarNumero(metros / 1000)} km`
    : `${formatarNumero(metros)} m`;
}

/** Formata peso de decolagem em gramas (`249 g`) ou quilogramas (`3,77 kg`). */
export function formatarPeso(gramas: number | undefined): string {
  if (typeof gramas !== 'number' || !Number.isFinite(gramas)) {
    return '—';
  }
  if (gramas >= 1000) {
    return `${formatadorPesoKg.format(gramas / 1000)} kg`;
  }
  return `${formatarNumero(gramas)} g`;
}

/** Normaliza resolução da câmera vinda crua do backend (`1080` -> `1080p`, `2160` -> `4K (2160p)`). */
export function formatarResolucao(resolucao: string | undefined): string {
  const texto = resolucao?.trim();
  if (!texto) {
    return 'Não informado';
  }
  if (texto === '2160') {
    return '4K (2160p)';
  }
  if (/^\d+$/.test(texto)) {
    return `${texto}p`;
  }
  return texto;
}

/** Normaliza taxa de quadros (`60` -> `60 fps`). */
export function formatarFps(fps: string | undefined): string {
  const texto = fps?.trim();
  if (!texto) {
    return 'Não informado';
  }
  return /fps/i.test(texto) ? texto : `${texto} fps`;
}

/** Normaliza frequência Wi-Fi (`2.4` -> `2.4 GHz`). */
export function formatarFrequencia(frequencia: string | undefined): string {
  const texto = frequencia?.trim();
  if (!texto) {
    return 'Não informado';
  }
  return /ghz|mhz/i.test(texto) ? texto : `${texto} GHz`;
}

/** Normaliza duração de bateria (`34` -> `34 min`). */
export function formatarDuracaoBateria(duracao: string | undefined): string {
  const texto = duracao?.trim();
  if (!texto) {
    return 'Não informado';
  }
  return /^\d+(?:[.,]\d+)?$/.test(texto) ? `${texto} min` : texto;
}

/** Formata zoom óptico/digital. */
export function formatarZoom(zoom: number | undefined): string {
  if (typeof zoom !== 'number' || !Number.isFinite(zoom)) {
    return '—';
  }
  return zoom > 1 ? `${formatarNumero(zoom)}x` : '1x (fixo)';
}

/** Resumo compacto da câmera para cards e destaque do topo da ficha. */
export function resumoCamera(drone: Drone, estilo: 'card' | 'detalhe' = 'detalhe'): string {
  if (!drone.possuiCamera) {
    return 'Sem câmera';
  }
  const camera = drone.camera;
  if (!camera) {
    return estilo === 'card' ? 'Com câmera' : 'Câmera integrada';
  }
  const res = formatarResolucao(camera.resolucao);
  if (estilo === 'card') {
    return camera.zoom > 1 ? `${res} · ${formatarNumero(camera.zoom)}x` : res;
  }
  return camera.fps ? `${res} · ${formatarFps(camera.fps)}` : res;
}
