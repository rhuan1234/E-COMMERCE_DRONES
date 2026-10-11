export interface EnderecoRequest {
  rua: string;
  bairro: string;
  cidade: {
    nome: string;
    estado: {
      nome: string;
    };
  };
  cep: string;
  principal: boolean;
}