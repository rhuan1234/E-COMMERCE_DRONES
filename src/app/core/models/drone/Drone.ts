export class Drone {
  id!: number;
  nome!: string;
  marca!: string;
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
