import { DroneImagem } from '../drone/Drone';

export interface ItemCarrinho {
  droneId: number;
  nome: string;
  preco: number;
  quantidade: number;
  estoqueDisponivel: number;
  imagem: DroneImagem | null;
}
