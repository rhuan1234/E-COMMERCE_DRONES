import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Drone } from '../../../../core/models/drone/Drone';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { PromocaoRequest } from '../../../../core/models/promocao/PromocaoRequest';
import { DroneService } from '../../../../core/services/DroneService';
import { PromocaoService } from '../../../../core/services/PromocaoService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { PromocaoForm } from './promocao-form';

describe('PromocaoForm', () => {
  let component: PromocaoForm;
  let fixture: ComponentFixture<PromocaoForm>;
  let routeSnapshot: { paramMap: ParamMap };
  let promocaoServiceMock: {
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let droneServiceMock: {
    findByModelo: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const drone1: Drone = {
    id: 1,
    nome: 'DJI Mavic 3 Pro',
    marca: { id: 1, nome: 'DJI' },
    modelo: { id: 10, nome: 'Mavic 3 Pro', marcaId: 1 },
    preco: 14500,
    quantidadeDisponivel: 5,
    ativa: true,
    tempoVooPratico: 43,
    pesoDecolagem: 958,
    altitudeMaxima: 6000,
    velocidadeMaxima: 75,
    alcanceTransmissao: 15000,
    possuiCamera: true,
    quantidadeMotores: 4,
    comControleRemoto: true,
    controladoPorAplicativo: true,
    quantidadeBaterias: 3,
    duracaoBateria: '43 min',
    frequenciaWifi: '5.8 GHz',
    possuiGPS: true,
    cameraId: 1,
    fornecedorId: 1,
  };

  const drone2: Drone = {
    ...drone1,
    id: 2,
    nome: 'DJI Air 3',
    modelo: { id: 11, nome: 'Air 3', marcaId: 1 },
  };

  const promocaoExistente: PromocaoRequest = {
    id: 5,
    nome: 'Black Friday Drones',
    percentualDesconto: 25,
    dataInicio: '2026-11-20T08:00:00',
    dataFim: '2026-11-30T23:59:00',
    droneIds: [1, 2],
  };

  function obterBotaoSalvar(): HTMLButtonElement {
    const botoes = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const botao = botoes.find(
      (btn) => btn.textContent?.includes('Salvar promoção') || btn.textContent?.includes('Salvando...'),
    );
    if (!botao) {
      throw new Error('Botão de salvar promoção não encontrado');
    }
    return botao;
  }

  function preencherFormularioValido(): void {
    component.form.patchValue({
      nome: 'Semana do Drone',
      percentualDesconto: 20,
      dataInicio: '2026-11-20T08:00',
      dataFim: '2026-11-30T23:59',
    });
    fixture.detectChanges();
  }

  beforeEach(async () => {
    routeSnapshot = {
      paramMap: convertToParamMap({}),
    };
    promocaoServiceMock = {
      findById: vi.fn().mockReturnValue(of(promocaoExistente)),
      create: vi.fn().mockReturnValue(of(promocaoExistente)),
      update: vi.fn().mockReturnValue(of(promocaoExistente)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    droneServiceMock = {
      findByModelo: vi.fn().mockReturnValue(
        of<PagedResponse<Drone>>({
          items: [drone1, drone2],
          page: 0,
          pageSize: 10,
          totalItems: 2,
          totalPages: 1,
        }),
      ),
      findById: vi.fn((id: number) => of(id === 1 ? drone1 : drone2)),
    };
    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(false),
      }),
    };
    snackBarMock = {
      open: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [PromocaoForm],
      providers: [
        provideRouter([]),
        { provide: PromocaoService, useValue: promocaoServiceMock },
        { provide: DroneService, useValue: droneServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: routeSnapshot,
          },
        },
      ],
    })
      .overrideProvider(MatDialog, { useValue: dialogMock })
      .overrideProvider(MatSnackBar, { useValue: snackBarMock });

    await TestBed.compileComponents();
  });

  async function criarComponente(id?: string): Promise<void> {
    routeSnapshot.paramMap = convertToParamMap(id ? { id } : {});
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(PromocaoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('validarIntervaloPromocao rejeita dataFim menor ou igual a dataInicio', async () => {
    await criarComponente();

    component.form.patchValue({
      nome: 'Promo Teste',
      percentualDesconto: 15,
      dataInicio: '2026-11-10T10:00',
      dataFim: '2026-11-10T10:00',
    });
    component.form.controls['dataFim'].markAsTouched();
    fixture.detectChanges();

    expect(component.form.hasError('intervaloInvalido')).toBe(true);
    expect(component.form.invalid).toBe(true);
    expect(obterBotaoSalvar().disabled).toBe(true);

    component.salvar();
    expect(promocaoServiceMock.create).not.toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Preencha todos os campos obrigatórios.',
      'Ok',
      expect.any(Object),
    );

    component.form.patchValue({ dataFim: '2026-11-09T10:00' });
    fixture.detectChanges();
    expect(component.form.hasError('intervaloInvalido')).toBe(true);
    expect(obterBotaoSalvar().disabled).toBe(true);

    component.form.patchValue({ dataFim: '2026-11-11T10:00' });
    fixture.detectChanges();
    expect(component.form.hasError('intervaloInvalido')).toBe(false);
    expect(component.form.valid).toBe(true);
    expect(obterBotaoSalvar().disabled).toBe(false);
  });

  it('pesquisarDrone aplica debounce de 250 ms, chama findByModelo uma única vez e limpa lista ao esvaziar input', async () => {
    await criarComponente();
    vi.useFakeTimers();

    const inputPesquisa = fixture.nativeElement.querySelector(
      'input[placeholder="Digite o nome, a marca ou o modelo"]',
    ) as HTMLInputElement;

    inputPesquisa.value = 'Mav';
    inputPesquisa.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(100);

    inputPesquisa.value = 'Mavic';
    inputPesquisa.dispatchEvent(new Event('input'));
    expect(droneServiceMock.findByModelo).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    fixture.detectChanges();

    expect(droneServiceMock.findByModelo).toHaveBeenCalledTimes(1);
    expect(droneServiceMock.findByModelo).toHaveBeenCalledWith(0, 10, 'Mavic');
    expect(component.dronesFiltrados).toEqual([drone1, drone2]);
    expect(fixture.nativeElement.textContent).toContain('DJI Mavic 3 Pro');

    inputPesquisa.value = '   ';
    inputPesquisa.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.dronesFiltrados).toEqual([]);
    vi.advanceTimersByTime(250);
    expect(droneServiceMock.findByModelo).toHaveBeenCalledTimes(1);
  });

  it('adicionarDrone evita duplicados e removerDrone remove o item selecionado', async () => {
    await criarComponente();

    component.adicionarDrone(drone1);
    component.adicionarDrone(drone1);
    component.adicionarDrone(drone2);
    fixture.detectChanges();

    expect(component.dronesSelecionados).toEqual([drone1, drone2]);

    component.removerDrone(drone1);
    fixture.detectChanges();

    expect(component.dronesSelecionados).toEqual([drone2]);
  });

  it('cria promoção válida formatando datas com :00, enviando droneIds e navegando para /admin/promocoes', async () => {
    await criarComponente();
    preencherFormularioValido();
    component.adicionarDrone(drone1);
    component.adicionarDrone(drone2);
    fixture.detectChanges();

    obterBotaoSalvar().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(promocaoServiceMock.create).toHaveBeenCalledWith({
      id: null,
      nome: 'Semana do Drone',
      percentualDesconto: 20,
      dataInicio: '2026-11-20T08:00:00',
      dataFim: '2026-11-30T23:59:00',
      droneIds: [1, 2],
    });
    expect(snackBarMock.open).toHaveBeenCalledWith('Promoção criada com sucesso!', 'Fechar', {
      duration: 3000,
    });
    expect(router.navigate).toHaveBeenCalledWith(['/admin/promocoes']);
  });

  it('carrega promoção e drones em modo edição (paramMap com id) e chama update ao salvar', async () => {
    await criarComponente('5');

    expect(promocaoServiceMock.findById).toHaveBeenCalledWith(5);
    expect(droneServiceMock.findById).toHaveBeenCalledWith(1);
    expect(droneServiceMock.findById).toHaveBeenCalledWith(2);
    expect(fixture.nativeElement.textContent).toContain('Editar promoção');
    expect(component.form.controls['dataInicio'].value).toBe('2026-11-20T08:00');
    expect(component.form.controls['dataFim'].value).toBe('2026-11-30T23:59');
    expect(component.dronesSelecionados).toEqual([drone1, drone2]);

    component.form.patchValue({ nome: 'Black Friday Estendida' });
    fixture.detectChanges();

    obterBotaoSalvar().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(promocaoServiceMock.update).toHaveBeenCalledWith(5, {
      id: 5,
      nome: 'Black Friday Estendida',
      percentualDesconto: 25,
      dataInicio: '2026-11-20T08:00:00',
      dataFim: '2026-11-30T23:59:00',
      droneIds: [1, 2],
    });
    expect(promocaoServiceMock.create).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/promocoes']);
  });

  it('previne envio duplicado enquanto salvando está true com requisição pendente', async () => {
    const pendente$ = new Subject<PromocaoRequest>();
    promocaoServiceMock.create.mockReturnValue(pendente$.asObservable());

    await criarComponente();
    preencherFormularioValido();

    const botaoSalvar = obterBotaoSalvar();
    botaoSalvar.click();
    botaoSalvar.click();
    component.salvar();
    fixture.detectChanges();

    expect(promocaoServiceMock.create).toHaveBeenCalledTimes(1);
    expect(component.salvando).toBe(true);
    expect(botaoSalvar.disabled).toBe(true);
    expect(botaoSalvar.textContent).toContain('Salvando...');

    pendente$.next(promocaoExistente);
    pendente$.complete();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.salvando).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/promocoes']);
  });

  it('excluir() abre ConfirmDialogComponent via MatDialog e só chama delete quando confirmado', async () => {
    await criarComponente('5');

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(false),
    });
    component.excluir();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Promoção',
        mensagem: 'Deseja realmente excluir a promoção "Black Friday Drones"?',
      },
    });
    expect(promocaoServiceMock.delete).not.toHaveBeenCalled();

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(true),
    });
    component.excluir();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(promocaoServiceMock.delete).toHaveBeenCalledWith(5);
    expect(snackBarMock.open).toHaveBeenCalledWith('Promoção excluída com sucesso!', 'Fechar', {
      duration: 3000,
    });
    expect(router.navigate).toHaveBeenCalledWith(['/admin/promocoes']);
  });
});
