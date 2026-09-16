import { Cidade } from './Cidade';

export interface Endereco {
  id: number;
  rua: string;
  bairro: string;
  cidade: Cidade;
  cep: string;
}