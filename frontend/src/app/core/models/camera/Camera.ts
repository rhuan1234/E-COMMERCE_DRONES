import { Marca } from '../marca/Marca';
import { Modelo } from '../modelo/Modelo';

export class Camera {
  id!: number;
  modeloId!: number;
  marcaId!: number;
  modelo?: Modelo;
  marca?: Marca;
  resolucao!: string;
  zoom!: number;
  estabilizacao!: boolean;
  fps!: string;
}