import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Camera } from '../../../../core/models/camera/Camera';
import { Marca } from '../../../../core/models/marca/Marca';
import { Modelo } from '../../../../core/models/modelo/Modelo';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { CameraService } from '../../../../core/services/CameraService';
import { MarcaService } from '../../../../core/services/MarcaService';
import { ModeloService } from '../../../../core/services/ModeloService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { CameraForm } from './camera-form';

describe('CameraForm', () => {
  let component: CameraForm;
  let fixture: ComponentFixture<CameraForm>;
  let routeData: { camera?: Camera };
  let cameraServiceMock: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let marcaServiceMock: { findAll: ReturnType<typeof vi.fn> };
  let modeloServiceMock: { findByMarca: ReturnType<typeof vi.fn> };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const marcasMock: Marca[] = [
    { id: 1, nome: 'DJI' },
    { id: 2, nome: 'Autel' },
  ];

  const modelosDjiMock: Modelo[] = [
    { id: 10, nome: 'Zenmuse X7', marcaId: 1 },
    { id: 11, nome: 'Zenmuse H20', marcaId: 1 },
  ];

  const cameraExistente: Camera = {
    id: 5,
    marcaId: 1,
    modeloId: 10,
    marca: marcasMock[0],
    modelo: modelosDjiMock[0],
    resolucao: '6K',
    zoom: 4,
    estabilizacao: true,
    fps: '60',
  };

  function obterBotaoSalvar(): HTMLButtonElement {
    const botao = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    if (!botao) {
      throw new Error('Botão submit não encontrado');
    }
    return botao;
  }

  beforeEach(async () => {
    routeData = {};
    cameraServiceMock = {
      create: vi.fn().mockReturnValue(of(cameraExistente)),
      update: vi.fn().mockReturnValue(of(cameraExistente)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    marcaServiceMock = {
      findAll: vi.fn().mockReturnValue(
        of<PagedResponse<Marca>>({
          items: marcasMock,
          page: 0,
          pageSize: 100,
          totalItems: 2,
          totalPages: 1,
        }),
      ),
    };
    modeloServiceMock = {
      findByMarca: vi.fn().mockReturnValue(
        of<PagedResponse<Modelo>>({
          items: modelosDjiMock,
          page: 0,
          pageSize: 100,
          totalItems: 2,
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
      imports: [CameraForm],
      providers: [
        provideRouter([]),
        { provide: CameraService, useValue: cameraServiceMock },
        { provide: MarcaService, useValue: marcaServiceMock },
        { provide: ModeloService, useValue: modeloServiceMock },
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

  async function criarComponente(camera?: Camera): Promise<void> {
    routeData.camera = camera;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(CameraForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('carrega marcas inicialmente e mantém modeloId desabilitado até selecionar marcaId', async () => {
    await criarComponente();

    expect(marcaServiceMock.findAll).toHaveBeenCalledWith(0, 100);
    expect(component.marcas).toEqual(marcasMock);
    expect(component.form.controls['modeloId'].disabled).toBe(true);
    expect(obterBotaoSalvar().disabled).toBe(true);

    component.form.controls['marcaId'].setValue(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.form.controls['modeloId'].enabled).toBe(true);
    expect(modeloServiceMock.findByMarca).toHaveBeenCalledWith(1, 0, 100);
    expect(component.modelos).toEqual(modelosDjiMock);

    component.form.controls['marcaId'].setValue(null);
    fixture.detectChanges();

    expect(component.form.controls['modeloId'].disabled).toBe(true);
    expect(component.modelos).toEqual([]);
  });

  it('bloqueia envio e marca erro marcaIncompativel quando modelo não pertence à marca selecionada', async () => {
    modeloServiceMock.findByMarca.mockReturnValue(
      of<PagedResponse<Modelo>>({
        items: [{ id: 99, nome: 'Modelo Outra Marca', marcaId: 2 }],
        page: 0,
        pageSize: 100,
        totalItems: 1,
        totalPages: 1,
      }),
    );

    await criarComponente();

    component.form.controls['marcaId'].setValue(1);
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({
      modeloId: 99,
      resolucao: '4K',
      zoom: 2,
      estabilizacao: true,
      fps: '60',
    });
    fixture.detectChanges();

    component.salvar();
    fixture.detectChanges();

    expect(component.form.controls['modeloId'].hasError('marcaIncompativel')).toBe(true);
    expect(cameraServiceMock.create).not.toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'O modelo selecionado deve pertencer à marca escolhida.',
      'Ok',
      expect.any(Object),
    );
    expect(fixture.nativeElement.textContent).toContain('O modelo deve pertencer à marca selecionada.');
  });

  it('chama CameraService.create e navega para /admin/cameras ao criar câmera válida', async () => {
    await criarComponente();

    component.form.controls['marcaId'].setValue(1);
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({
      modeloId: 10,
      resolucao: '6K',
      zoom: 4,
      estabilizacao: true,
      fps: '60',
    });
    fixture.detectChanges();

    const botaoSalvar = obterBotaoSalvar();
    expect(botaoSalvar.disabled).toBe(false);
    botaoSalvar.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(cameraServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        marcaId: 1,
        modeloId: 10,
        resolucao: '6K',
        zoom: 4,
        estabilizacao: true,
        fps: '60',
      }),
    );
    expect(snackBarMock.open).toHaveBeenCalledWith('Câmera salva com sucesso!', 'Ok', expect.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/admin/cameras']);
  });

  it('preenche formulário em modo edição via snapshot.data["camera"] e chama update', async () => {
    await criarComponente(cameraExistente);

    expect(fixture.nativeElement.textContent).toContain('Editar câmera');
    expect(modeloServiceMock.findByMarca).toHaveBeenCalledWith(1, 0, 100);
    expect(component.form.controls['modeloId'].value).toBe(10);

    component.form.patchValue({ resolucao: '8K' });
    fixture.detectChanges();

    obterBotaoSalvar().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(cameraServiceMock.update).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        id: 5,
        marcaId: 1,
        modeloId: 10,
        resolucao: '8K',
      }),
    );
    expect(cameraServiceMock.create).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/cameras']);
  });

  it('previne envio duplicado enquanto salvando é true com requisição pendente', async () => {
    const pendente$ = new Subject<Camera>();
    cameraServiceMock.create.mockReturnValue(pendente$.asObservable());

    await criarComponente();
    component.form.controls['marcaId'].setValue(1);
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({
      modeloId: 10,
      resolucao: '4K',
      zoom: 2,
      estabilizacao: false,
      fps: '30',
    });
    fixture.detectChanges();

    const botaoSalvar = obterBotaoSalvar();
    botaoSalvar.click();
    botaoSalvar.click();
    component.salvar();
    fixture.detectChanges();

    expect(cameraServiceMock.create).toHaveBeenCalledTimes(1);
    expect(component.salvando).toBe(true);
    expect(botaoSalvar.disabled).toBe(true);
    expect(botaoSalvar.textContent).toContain('Salvando...');

    pendente$.next(cameraExistente);
    pendente$.complete();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.salvando).toBe(false);
  });

  it('trata erro da API ao salvar câmera reabilitando o envio e exibindo mensagem', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    cameraServiceMock.create.mockReturnValue(throwError(() => ({ status: 500 })));

    await criarComponente();
    component.form.controls['marcaId'].setValue(1);
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({
      modeloId: 10,
      resolucao: '4K',
      zoom: 2,
      estabilizacao: true,
      fps: '60',
    });
    fixture.detectChanges();

    obterBotaoSalvar().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.salvando).toBe(false);
    expect(obterBotaoSalvar().disabled).toBe(false);
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Não foi possível salvar a câmera.',
      'Ok',
      expect.any(Object),
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('abre confirmação via MatDialog em excluir() e só chama delete quando confirmado', async () => {
    await criarComponente(cameraExistente);

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(false),
    });
    component.excluir();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Câmera',
        mensagem: 'Deseja realmente excluir a câmera "Zenmuse X7"?',
      },
    });
    expect(cameraServiceMock.delete).not.toHaveBeenCalled();

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(true),
    });
    component.excluir();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(cameraServiceMock.delete).toHaveBeenCalledWith(5);
    expect(snackBarMock.open).toHaveBeenCalledWith('Câmera excluída com sucesso!', 'Ok', expect.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/admin/cameras']);
  });
});
