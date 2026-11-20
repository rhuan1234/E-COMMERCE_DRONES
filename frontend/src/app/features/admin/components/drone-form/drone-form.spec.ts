import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Camera } from '../../../../core/models/camera/Camera';
import { Drone } from '../../../../core/models/drone/Drone';
import { Fornecedor } from '../../../../core/models/fornecedor/FornecedorRequest';
import { Marca } from '../../../../core/models/marca/Marca';
import { Modelo } from '../../../../core/models/modelo/Modelo';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { CameraService } from '../../../../core/services/CameraService';
import { DroneService } from '../../../../core/services/DroneService';
import { FornecedorService } from '../../../../core/services/FornecedorService';
import { MarcaService } from '../../../../core/services/MarcaService';
import { ModeloService } from '../../../../core/services/ModeloService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { DroneForm } from './drone-form';

describe('DroneForm', () => {
  let component: DroneForm;
  let fixture: ComponentFixture<DroneForm>;
  let routeData: { drone?: Drone };
  let droneServiceMock: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let marcaServiceMock: { findAll: ReturnType<typeof vi.fn> };
  let modeloServiceMock: { findByMarca: ReturnType<typeof vi.fn> };
  let cameraServiceMock: { findAll: ReturnType<typeof vi.fn> };
  let fornecedorServiceMock: { findAll: ReturnType<typeof vi.fn> };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const marcasMock: Marca[] = [{ id: 1, nome: 'DJI' }];
  const modelosMock: Modelo[] = [{ id: 10, nome: 'Mavic 3 Pro', marcaId: 1 }];
  const camerasMock: Camera[] = [
    {
      id: 3,
      marcaId: 1,
      modeloId: 10,
      marca: marcasMock[0],
      modelo: modelosMock[0],
      resolucao: '5.1K',
      zoom: 3,
      estabilizacao: true,
      fps: '60',
    },
  ];
  const fornecedoresMock: Fornecedor[] = [
    {
      id: 2,
      nome: 'Aero Brasil Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'contato@aerobrasil.com',
      telefone: '(63) 99999-8888',
      ativo: true,
      endereco: {
        id: 1,
        cep: '77001-090',
        rua: 'Av. Principal',
        bairro: 'Centro',
        cidade: { nome: 'Palmas', estado: { nome: 'TO' } },
      },
    },
  ];

  const droneExistente: Drone = {
    id: 7,
    nome: 'DJI Mavic 3 Pro',
    marca: marcasMock[0],
    modelo: modelosMock[0],
    preco: 14500,
    quantidadeDisponivel: 8,
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
    camera: camerasMock[0],
    cameraId: 3,
    fornecedorId: 2,
  };

  function obterBotaoSalvar(): HTMLButtonElement {
    const botoes = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const botao = botoes.find(
      (btn) => btn.textContent?.includes('Salvar drone') || btn.textContent?.includes('Salvando...'),
    );
    if (!botao) {
      throw new Error('Botão de salvar drone não encontrado');
    }
    return botao;
  }

  async function preencherFormularioValido(): Promise<void> {
    component.form.controls['marcaId'].setValue(1);
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({
      nome: 'DJI Air 3',
      modeloId: 10,
      preco: 8500,
      quantidadeDisponivel: 10,
      ativa: true,
      tempoVooPratico: 46,
      pesoDecolagem: 720,
      altitudeMaxima: 6000,
      velocidadeMaxima: 75,
      alcanceTransmissao: 20000,
      possuiCamera: true,
      cameraId: 3,
      quantidadeMotores: 4,
      comControleRemoto: true,
      controladoPorAplicativo: true,
      quantidadeBaterias: 2,
      duracaoBateria: '46 min',
      frequenciaWifi: '5.8 GHz',
      possuiGPS: true,
      fornecedorId: 2,
    });
    fixture.detectChanges();
  }

  beforeEach(async () => {
    routeData = {};
    droneServiceMock = {
      create: vi.fn().mockReturnValue(of(droneExistente)),
      update: vi.fn().mockReturnValue(of(droneExistente)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    marcaServiceMock = {
      findAll: vi.fn().mockReturnValue(
        of<PagedResponse<Marca>>({ items: marcasMock, page: 0, pageSize: 100, totalItems: 1, totalPages: 1 }),
      ),
    };
    modeloServiceMock = {
      findByMarca: vi.fn().mockReturnValue(
        of<PagedResponse<Modelo>>({ items: modelosMock, page: 0, pageSize: 100, totalItems: 1, totalPages: 1 }),
      ),
    };
    cameraServiceMock = {
      findAll: vi.fn().mockReturnValue(
        of<PagedResponse<Camera>>({ items: camerasMock, page: 0, pageSize: 100, totalItems: 1, totalPages: 1 }),
      ),
    };
    fornecedorServiceMock = {
      findAll: vi.fn().mockReturnValue(
        of<PagedResponse<Fornecedor>>({
          items: fornecedoresMock,
          page: 0,
          pageSize: 100,
          totalItems: 1,
          totalPages: 1,
        }),
      ),
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
      imports: [DroneForm],
      providers: [
        provideRouter([]),
        { provide: DroneService, useValue: droneServiceMock },
        { provide: MarcaService, useValue: marcaServiceMock },
        { provide: ModeloService, useValue: modeloServiceMock },
        { provide: CameraService, useValue: cameraServiceMock },
        { provide: FornecedorService, useValue: fornecedorServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: routeData,
            },
          },
        },
      ],
    })
      .overrideProvider(MatDialog, { useValue: dialogMock })
      .overrideProvider(MatSnackBar, { useValue: snackBarMock });

    await TestBed.compileComponents();
  });

  async function criarComponente(drone?: Drone): Promise<void> {
    routeData.drone = drone;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(DroneForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('carrega marcas, câmeras e fornecedores inicialmente e mantém stepper linear em criação', async () => {
    await criarComponente();

    expect(marcaServiceMock.findAll).toHaveBeenCalledWith(0, 100);
    expect(cameraServiceMock.findAll).toHaveBeenCalledWith(0, 100);
    expect(fornecedorServiceMock.findAll).toHaveBeenCalledWith(0, 100);
    expect(component.marcas).toEqual(marcasMock);
    expect(component.cameras).toEqual(camerasMock);
    expect(component.fornecedores).toEqual(fornecedoresMock);

    const stepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance as MatStepper;
    expect(stepper.linear).toBe(true);
  });

  it('habilita modeloId e chama ModeloService.findByMarca ao selecionar marcaId', async () => {
    await criarComponente();

    expect(component.form.controls['modeloId'].disabled).toBe(true);

    component.form.controls['marcaId'].setValue(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.form.controls['modeloId'].enabled).toBe(true);
    expect(modeloServiceMock.findByMarca).toHaveBeenCalledWith(1, 0, 100);
    expect(component.modelos).toEqual(modelosMock);

    component.form.controls['marcaId'].setValue(null);
    fixture.detectChanges();

    expect(component.form.controls['modeloId'].disabled).toBe(true);
    expect(component.modelos).toEqual([]);
  });

  it('atualiza obrigatoriedade de cameraId ao alternar possuiCamera', async () => {
    await criarComponente();

    const possuiCameraCtrl = component.form.controls['possuiCamera'];
    const cameraIdCtrl = component.form.controls['cameraId'];

    expect(possuiCameraCtrl.value).toBe(false);
    expect(cameraIdCtrl.valid).toBe(true);

    possuiCameraCtrl.setValue(true);
    fixture.detectChanges();
    expect(cameraIdCtrl.invalid).toBe(true);
    expect(cameraIdCtrl.hasError('required')).toBe(true);

    possuiCameraCtrl.setValue(false);
    fixture.detectChanges();
    expect(cameraIdCtrl.valid).toBe(true);
  });

  it('bloqueia envio quando o formulário é inválido', async () => {
    await criarComponente();

    const botaoSalvar = obterBotaoSalvar();
    expect(botaoSalvar.disabled).toBe(true);

    component.salvar();
    fixture.detectChanges();

    expect(droneServiceMock.create).not.toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Revise os campos destacados antes de salvar.',
      'Ok',
      expect.any(Object),
    );
  });

  it('chama DroneService.create e navega para /admin/drones ao enviar drone válido', async () => {
    await criarComponente();
    await preencherFormularioValido();

    const botaoSalvar = obterBotaoSalvar();
    expect(botaoSalvar.disabled).toBe(false);

    botaoSalvar.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(droneServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'DJI Air 3',
        marcaId: 1,
        modeloId: 10,
        fornecedorId: 2,
        cameraId: 3,
      }),
    );
    expect(snackBarMock.open).toHaveBeenCalledWith('Drone salvo com sucesso!', 'Ok', expect.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/admin/drones']);
  });

  it('preenche formulário em modo edição, deixa stepper não linear e chama update ao salvar', async () => {
    await criarComponente(droneExistente);

    expect(fixture.nativeElement.textContent).toContain('Editar drone');
    expect(component.form.controls['nome'].value).toBe('DJI Mavic 3 Pro');
    expect(component.form.controls['modeloId'].value).toBe(10);
    expect(component.form.controls['cameraId'].value).toBe(3);

    const stepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance as MatStepper;
    expect(stepper.linear).toBe(false);

    component.form.patchValue({ preco: 13900 });
    fixture.detectChanges();

    obterBotaoSalvar().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(droneServiceMock.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        id: 7,
        nome: 'DJI Mavic 3 Pro',
        preco: 13900,
      }),
    );
    expect(droneServiceMock.create).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/drones']);
  });

  it('previne envio duplicado enquanto requisição de criação está pendente', async () => {
    const pendente$ = new Subject<Drone>();
    droneServiceMock.create.mockReturnValue(pendente$.asObservable());

    await criarComponente();
    await preencherFormularioValido();

    const botaoSalvar = obterBotaoSalvar();
    botaoSalvar.click();
    botaoSalvar.click();
    component.salvar();
    fixture.detectChanges();

    expect(droneServiceMock.create).toHaveBeenCalledTimes(1);
    expect(component.salvando).toBe(true);
    expect(botaoSalvar.disabled).toBe(true);
    expect(botaoSalvar.textContent).toContain('Salvando...');

    pendente$.next(droneExistente);
    pendente$.complete();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.salvando).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/drones']);
  });

  it('abre diálogo de confirmação em excluir() e só exclui quando confirmado', async () => {
    await criarComponente(droneExistente);

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(false),
    });
    component.excluir();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Drone',
        mensagem: 'Deseja realmente excluir o drone "DJI Mavic 3 Pro"?',
      },
    });
    expect(droneServiceMock.delete).not.toHaveBeenCalled();

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(true),
    });
    component.excluir();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(droneServiceMock.delete).toHaveBeenCalledWith(7);
    expect(snackBarMock.open).toHaveBeenCalledWith('Drone excluído com sucesso!', 'Ok', expect.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/admin/drones']);
  });
});
