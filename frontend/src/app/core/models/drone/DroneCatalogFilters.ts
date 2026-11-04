export interface DroneCatalogFilters {
  nome?: string;
  modelo?: string;
  min?: number;
  max?: number;
  alcance?: string[];
  autonomia?: string[];
  camera?: string[];
  possuiGPS?: boolean;
  comControleRemoto?: boolean;
  controladoPorAplicativo?: boolean;
}

export type DroneCatalogFeature =
  | 'possuiGPS'
  | 'comControleRemoto'
  | 'controladoPorAplicativo';
