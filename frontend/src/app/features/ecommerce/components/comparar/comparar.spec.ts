import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Drone } from '../../../../core/models/drone/Drone';
import { ComparacaoService } from '../../../../core/services/ComparacaoService';
import { DroneService } from '../../../../core/services/DroneService';
import { Comparar } from './comparar';

function criarDrone(dados: Pick<Drone, 'id' | 'nome' | 'preco'> & Partial<Drone>): Drone {
  return Object.assign(new Drone(), { imagens: [], ...dados });
}

describe('Comparar', () => {
  const catalogo = new Map<number, Drone>([
    [1, criarDrone({ id: 1, nome: 'Leve', preco: 5000, pesoDecolagem: 249, tempoVooPratico: 34, possuiGPS: true })],
    [2, criarDrone({ id: 2, nome: 'Autonomo', preco: 9000, pesoDecolagem: 720, tempoVooPratico: 46, possuiGPS: false })],
  ]);
  const droneService = {
    findByIdEcommerce: vi.fn((id: number) =>
      catalogo.has(id)
        ? of(catalogo.get(id)!)
        : throwError(() => new HttpErrorResponse({ status: 404 })),
    ),
    obterUrlImagem: vi.fn(() => ''),
  };
  let fixture: ComponentFixture<Comparar>;
  let comparacao: ComparacaoService;

  async function criar(): Promise<HTMLElement> {
    fixture = TestBed.createComponent(Comparar);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    sessionStorage.clear();
    droneService.findByIdEcommerce.mockClear();
    await TestBed.configureTestingModule({
      imports: [Comparar],
      providers: [provideRouter([]), { provide: DroneService, useValue: droneService }],
    }).compileComponents();
    comparacao = TestBed.inject(ComparacaoService);
  });

  it('shows an empty state pointing to the catalog when nothing is selected', async () => {
    const pagina = await criar();

    expect(pagina.querySelector('.compare-empty')).not.toBeNull();
    expect(pagina.querySelector('.comparison-table')).toBeNull();
    expect(droneService.findByIdEcommerce).not.toHaveBeenCalled();
  });

  it('loads the selected drones and marks the best value of each row', async () => {
    comparacao.alternar({ id: 1, nome: 'Leve' });
    comparacao.alternar({ id: 2, nome: 'Autonomo' });
    const pagina = await criar();

    const tabela = pagina.querySelector('.comparison-table') as HTMLTableElement;
    expect(tabela).not.toBeNull();
    expect(droneService.findByIdEcommerce).toHaveBeenCalledTimes(2);
    expect(tabela.querySelectorAll('thead .compare-column')).toHaveLength(2);
    expect(tabela.querySelector('.add-compare')?.getAttribute('href')).toBe('/home');

    const linhaPeso = Array.from(tabela.querySelectorAll('tbody tr'))
      .find((linha) => linha.textContent?.includes('Peso de decolagem'));
    expect(linhaPeso?.querySelectorAll('td')[0].textContent).toContain('mais leve');
    expect(linhaPeso?.querySelectorAll('td')[1].textContent).not.toContain('mais leve');
  });

  it('removes a drone from the comparison without refetching the others', async () => {
    comparacao.alternar({ id: 1, nome: 'Leve' });
    comparacao.alternar({ id: 2, nome: 'Autonomo' });
    const pagina = await criar();

    (pagina.querySelector('.remove-compare') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(comparacao.itens().map((item) => item.id)).toEqual([2]);
    expect(pagina.querySelectorAll('thead .compare-column')).toHaveLength(1);
    expect(droneService.findByIdEcommerce).toHaveBeenCalledTimes(2);
  });

  it('drops drones that left the catalog and tells the user', async () => {
    comparacao.alternar({ id: 1, nome: 'Leve' });
    comparacao.alternar({ id: 99, nome: 'Removido' });
    const pagina = await criar();

    expect(comparacao.itens().map((item) => item.id)).toEqual([1]);
    expect(pagina.querySelector('.compare-notice')?.textContent).toContain('não está mais no catálogo');
    expect(pagina.querySelectorAll('thead .compare-column')).toHaveLength(1);
  });
});
