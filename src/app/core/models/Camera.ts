import { Marca } from "./Marca";

export class Camera{
    id!: number;
    modelo!: string;
    marca!: Marca;
    resolucao!: string;
    zoom!: number;
    estabilizacao!: boolean;
    fps!: string;
}