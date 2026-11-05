import { Pipe, PipeTransform } from '@angular/core';

const FORMATADOR_BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Formata valores em reais no padrão brasileiro: `R$ 21.999,00`. */
@Pipe({ name: 'brl', standalone: true })
export class MoedaBrlPipe implements PipeTransform {
  transform(valor: number | string | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') {
      return '—';
    }
    const numero = Number(valor);
    return Number.isFinite(numero) ? FORMATADOR_BRL.format(numero) : '—';
  }
}
