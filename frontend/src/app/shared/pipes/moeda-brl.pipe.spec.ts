import { MoedaBrlPipe } from './moeda-brl.pipe';

describe('MoedaBrlPipe', () => {
  const pipe = new MoedaBrlPipe();
  // Intl usa espaço inseparável entre "R$" e o valor
  const normalizar = (texto: string) => texto.replace(/\s/g, ' ');

  it('formata valores no padrão brasileiro', () => {
    expect(normalizar(pipe.transform(21999))).toBe('R$ 21.999,00');
    expect(normalizar(pipe.transform('7499.9'))).toBe('R$ 7.499,90');
  });

  it('exibe travessão para valores ausentes ou inválidos', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform('abc')).toBe('—');
  });
});
