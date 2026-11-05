import { TestBed } from '@angular/core/testing';
import { ComparacaoService, LIMITE_COMPARACAO } from './ComparacaoService';

describe('ComparacaoService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  it('toggles drones and respects the selection limit', () => {
    const service = TestBed.inject(ComparacaoService);

    for (let id = 1; id <= LIMITE_COMPARACAO; id++) {
      expect(service.alternar({ id, nome: `Drone ${id}` })).toBe(true);
    }
    expect(service.cheia()).toBe(true);
    expect(service.alternar({ id: 99, nome: 'Excedente' })).toBe(false);
    expect(service.contem(99)).toBe(false);

    service.alternar({ id: 1, nome: 'Drone 1' });
    expect(service.contem(1)).toBe(false);
    expect(service.quantidade()).toBe(LIMITE_COMPARACAO - 1);
  });

  it('keeps the selection in the session across service instances', () => {
    TestBed.inject(ComparacaoService).alternar({ id: 7, nome: 'Mavic' });

    TestBed.resetTestingModule();
    expect(TestBed.inject(ComparacaoService).itens()).toEqual([{ id: 7, nome: 'Mavic' }]);
  });

  it('ignores corrupted session data', () => {
    sessionStorage.setItem('skyline.comparacao', '{nao-e-json');
    expect(TestBed.inject(ComparacaoService).itens()).toEqual([]);
  });
});
