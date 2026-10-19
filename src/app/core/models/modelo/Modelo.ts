import { Marca } from '../marca/Marca';

export class Modelo {
  id!: number;
  nome!: string;
  marcaId!: number;
  marca?: Marca;
}
