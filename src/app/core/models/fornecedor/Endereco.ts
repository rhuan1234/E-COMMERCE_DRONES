import { Cidade } from './Cidade';

export class Endereco {
  id!: number;
  rua!: string;
  bairro!: string;
  cidade!: Cidade;
  cep!: string;
}