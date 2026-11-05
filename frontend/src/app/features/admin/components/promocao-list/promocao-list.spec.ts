import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { PromocaoRequest } from '../../../../core/models/promocao/PromocaoRequest';
import { PromocaoService } from '../../../../core/services/PromocaoService';
import { PromocaoList } from './promocao-list';

describe('PromocaoList', () => {
  let component: PromocaoList;
  let fixture: ComponentFixture<PromocaoList>;
  let promocaoService: { findAll: ReturnType<typeof vi.fn>; findByNome: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  const promocao = (dataInicio: string, dataFim: string): PromocaoRequest => ({
    id: 1,
    nome: 'Black Friday',
    percentualDesconto: 20,
    dataInicio,
    dataFim,
    droneIds: [1, 2],
  });

  async function criar(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [PromocaoList],
      providers: [provideRouter([]), { provide: PromocaoService, useValue: promocaoService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PromocaoList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(() => {
    promocaoService = {
      findAll: vi.fn().mockReturnValue(
        of({
          items: [promocao('2026-11-01T00:00:00', '2026-11-30T23:59:00')],
          page: 0,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1,
        }),
      ),
      findByNome: vi.fn(),
      delete: vi.fn(),
    };
  });

  it('carrega as promoções e encerra o estado de carregamento', async () => {
    await criar();

    expect(promocaoService.findAll).toHaveBeenCalledWith(0, 10);
    expect(component.carregando).toBe(false);
    expect(component.erroCarregamento).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Black Friday');
  });

  it('mostra mensagem de erro quando a API falha', async () => {
    promocaoService.findAll.mockReturnValue(throwError(() => ({ status: 500 })));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await criar();

    expect(component.carregando).toBe(false);
    expect(component.erroCarregamento).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Não foi possível carregar as promoções');
  });

  describe('statusPromocao', () => {
    beforeEach(async () => {
      await criar();
    });

    const agora = new Date('2026-11-05T12:00:00');

    it('considera vigente quando a data atual está dentro do intervalo, inclusive nos limites', () => {
      expect(component.statusPromocao(promocao('2026-11-01T00:00:00', '2026-11-30T23:59:00'), agora)).toBe('vigente');
      expect(component.statusPromocao(promocao('2026-11-05T12:00:00', '2026-11-05T12:00:00'), agora)).toBe('vigente');
    });

    it('considera agendada antes do início e encerrada depois do fim', () => {
      expect(component.statusPromocao(promocao('2026-12-01T00:00:00', '2026-12-31T23:59:00'), agora)).toBe('agendada');
      expect(component.statusPromocao(promocao('2026-02-01T00:00:00', '2026-02-28T23:59:00'), agora)).toBe('encerrada');
    });
  });
});
