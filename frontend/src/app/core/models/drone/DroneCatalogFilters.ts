export interface DroneCatalogFilters {
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
