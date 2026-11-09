export interface Avaliacao {
  id: number;
  nota: number;
  comentario: string | null;
  nomeCliente: string;
  dataAvaliacao: string;
  usuarioId: number;
  droneId: number;
}
