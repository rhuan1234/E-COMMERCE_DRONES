import { Marca } from "../marca/Marca";
import { Modelo } from "../modelo/Modelo";
import { Camera } from "../camera/Camera";

export interface DroneImagem {
  id: number;
  caminho: string;
  principal: boolean;
  ordem: number;
}

export class Drone {
  id!: number;
  nome!: string;
  marca!: Marca;
  modelo!: Modelo;
  preco!: number;
  quantidadeDisponivel!: number;
  ativa!: boolean;
  tempoVooPratico!: number;
  pesoDecolagem!: number;
  altitudeMaxima!: number;
  velocidadeMaxima!: number;
  alcanceTransmissao!: number;
  possuiCamera!: boolean;
  quantidadeMotores!: number;
  comControleRemoto!: boolean;
  controladoPorAplicativo!: boolean;
  quantidadeBaterias!: number;
  duracaoBateria!: string;
  frequenciaWifi!: string;
  possuiGPS!: boolean;
  camera?: Camera;
  cameraId!: number;
  fornecedorId!: number;
  imagens?: DroneImagem[];
}
