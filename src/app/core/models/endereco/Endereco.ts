export interface Endereco {
  id: number;
  rua: string;
  bairro: string;
  cidade: {
    id: number;
    nome: string;
    estado: {
      id: number;
      nome: string;
    };
  };
  cep: string;
  principal: boolean;
}