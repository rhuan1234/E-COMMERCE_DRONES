export interface PromocaoRequest{
    id: number,
    nome: string;
    percentualDesconto: number;
    dataInicio: string,
    dataFim: string;
    droneIds: number[]
}