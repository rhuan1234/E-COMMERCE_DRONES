import {Endereco } from './Endereco';

export class Fornecedor {
    id!: number;
    nome!: string;
    cnpj!: string;
    email!: string;
    telefone!: string;
    ativo!: boolean;
    endereco!: Endereco;
    
}