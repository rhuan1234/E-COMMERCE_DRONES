export interface DroneImagem {
  id: number;
  caminho: string;
  principal: boolean;
  ordem: number;
}

interface Marca {
  id: number;
  nome: string
}
interface Modelo {
  id: number;
  nome: string
}

export class Drone {
  id!: number;
  nome!: string;
  marca!: Marca;
  modelo!: string;
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
  cameraId!: number;
  fornecedorId!: number;
  imagens?: DroneImagem[];
}