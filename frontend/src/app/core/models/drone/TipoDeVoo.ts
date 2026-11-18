import { DroneCatalogFeature } from './DroneCatalogFilters';

/** Grupos de filtro do catálogo que um atalho pode pré-selecionar. */
export type CatalogFilterKey = 'alcance' | 'autonomia' | 'camera';

/**
 * Atalho "Escolha pelo seu tipo de voo": combinação de filtros já existentes
 * no catálogo (`GET /drones`). Não cria novos parâmetros de API.
 */
export interface TipoDeVoo {
  id: string;
  titulo: string;
  descricao: string;
  resumo: string;
  icone: string;
  filtros: Partial<Record<CatalogFilterKey, string[]>>;
  recursos: DroneCatalogFeature[];
}

export const TIPOS_DE_VOO: readonly TipoDeVoo[] = [
  {
    id: 'primeiro-voo',
    titulo: 'Primeiro voo',
    descricao: 'Fáceis de pilotar, com GPS e controle pelo aplicativo.',
    resumo: 'GPS · aplicativo',
    icone: 'flight_takeoff',
    filtros: {},
    recursos: ['possuiGPS', 'controladoPorAplicativo'],
  },
  {
    id: 'viagem',
    titulo: 'Viagem e vlog',
    descricao: 'Câmera nítida e bateria para cobrir o passeio inteiro.',
    resumo: 'Full HD / 4K · 20 a 40 min',
    icone: 'landscape',
    filtros: { camera: ['4K', 'FULL_HD'], autonomia: ['DE_20_A_40_MIN'] },
    recursos: [],
  },
  {
    id: 'cinema',
    titulo: 'Fotografia e cinema',
    descricao: 'Imagem estabilizada e voos longos para planos completos.',
    resumo: '4K estabilizado · +40 min',
    icone: 'videocam',
    filtros: { camera: ['4K', 'ESTABILIZACAO'], autonomia: ['ACIMA_40_MIN'] },
    recursos: [],
  },
  {
    id: 'longo-alcance',
    titulo: 'Longo alcance',
    descricao: 'Transmissão estável para inspeções e áreas abertas.',
    resumo: 'Acima de 10 km',
    icone: 'settings_input_antenna',
    filtros: { alcance: ['DE_10_A_20KM', 'DE_20_A_50KM', 'ACIMA_50KM'] },
    recursos: [],
  },
];
