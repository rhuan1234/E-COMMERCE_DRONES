import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnderecoResponse } from '../../../../core/models/endereco/EnderecoResponse';
import { Fornecedor } from '../../../../core/models/fornecedor/FornecedorRequest';
import { EnderecoService } from '../../../../core/services/EnderecoService';
import { FornecedorService } from '../../../../core/services/FornecedorService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { FornecedorForm } from './fornecedor-form';

describe('FornecedorForm', () => {
  let component: FornecedorForm;
  let fixture: ComponentFixture<FornecedorForm>;
  let routeData: { fornecedor?: Fornecedor };
  let fornecedorServiceMock: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let enderecoServiceMock: { buscarCep: ReturnType<typeof vi.fn> };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const fornecedorExistente: Fornecedor = {
    id: 12,
    nome: 'Fly Tech Distribuidora',
    cnpj: '12.345.678/0001-90',
    email: 'contato@flytech.com.br',
    telefone: '(63) 99999-8888',
    ativo: true,
    endereco: {
      id: 4,
      cep: '77001-090',
      rua: 'Quadra 104 Sul',
      bairro: 'Plano Diretor Sul',
      cidade: {
        nome: 'Palmas',
        estado: { nome: 'TO' },
      },
    },
  };

  function obterBotaoSalvar(): HTMLButtonElement {
    const botoes = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const botao = botoes.find(
      (btn) => btn.textContent?.includes('Salvar fornecedor') || btn.textContent?.includes('Salvando...'),
    );
    if (!botao) {
      throw new Error('Botão de salvar fornecedor não encontrado');
    }
    return botao;
  }

  function preencherFormularioValido(): void {
    component.form.patchValue({
      nome: 'Skyline Tech Drones',
      cnpj: '12.345.678/0001-90',
      email: 'contato@skylinedrones.com.br',
      ativo: true,
      telefone: '(63) 99999-8888',
      endereco: {
        cep: '77001-090',
        rua: 'Quadra 104 Sul',
        bairro: 'Plano Diretor Sul',
        cidade: {
          nome: 'Palmas',
          estado: { nome: 'TO' },
        },
      },
    });
    fixture.detectChanges();
  }

  beforeEach(async () => {
    routeData = {};
    fornecedorServiceMock = {
      create: vi.fn().mockReturnValue(of(fornecedorExistente)),
      update: vi.fn().mockReturnValue(of(fornecedorExistente)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    enderecoServiceMock = {
      buscarCep: vi.fn().mockReturnValue(
        of<EnderecoResponse>({
          cep: '77001-090',
          logradouro: 'Quadra 104 Sul',
          bairro: 'Plano Diretor Sul',
          localidade: 'Palmas',
          uf: 'TO',
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
      imports: [FornecedorForm],
      providers: [
        provideRouter([]),
        { provide: FornecedorService, useValue: fornecedorServiceMock },
        { provide: EnderecoService, useValue: enderecoServiceMock },
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

  async function criarComponente(fornecedor?: Fornecedor): Promise<void> {
    routeData.fornecedor = fornecedor;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(FornecedorForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza formulário de criação e mantém botão de submit desabilitado quando inválido', async () => {
    await criarComponente();

    expect(fixture.nativeElement.textContent).toContain('Novo fornecedor');
    const botaoSalvar = obterBotaoSalvar();
    expect(botaoSalvar.disabled).toBe(true);
    expect(botaoSalvar.textContent).toContain('Salvar fornecedor');

    component.salvar();
    expect(fornecedorServiceMock.create).not.toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Revise os campos destacados antes de salvar.',
      'Ok',
      expect.any(Object),
    );
  });

  it('trata buscarCep para CEP inválido, sucesso, CEP não encontrado e erro HTTP', async () => {
    await criarComponente();

    component.form.get('endereco.cep')?.setValue('');
    component.buscarCep(true);
    expect(enderecoServiceMock.buscarCep).not.toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith('Informe o CEP para consulta.', 'Ok', expect.any(Object));

    component.form.get('endereco.cep')?.setValue('1234');
    component.buscarCep(true);
    expect(enderecoServiceMock.buscarCep).not.toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'CEP inválido! O CEP deve conter 8 dígitos.',
      'Ok',
      expect.any(Object),
    );

    component.form.get('endereco.cep')?.setValue('77001-090');
    component.buscarCep(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(enderecoServiceMock.buscarCep).toHaveBeenCalledWith('77001090');
    expect(component.carregandoCep).toBe(false);
    expect(component.form.get('endereco.rua')?.value).toBe('Quadra 104 Sul');
    expect(component.form.get('endereco.bairro')?.value).toBe('Plano Diretor Sul');
    expect(component.form.get('endereco.cidade.nome')?.value).toBe('Palmas');
    expect(component.form.get('endereco.cidade.estado.nome')?.value).toBe('TO');

    enderecoServiceMock.buscarCep.mockReturnValueOnce(of<EnderecoResponse>({ erro: true }));
    component.buscarCep(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.carregandoCep).toBe(false);
    expect(snackBarMock.open).toHaveBeenCalledWith('CEP não encontrado!', 'Ok', expect.any(Object));

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    enderecoServiceMock.buscarCep.mockReturnValueOnce(throwError(() => ({ status: 500 })));
    component.buscarCep(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.carregandoCep).toBe(false);
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Erro ao consultar o CEP no ViaCEP.',
      'Ok',
      expect.any(Object),
    );
  });

  it('chama FornecedorService.create e navega para /admin/fornecedores ao criar fornecedor válido', async () => {
    await criarComponente();
    preencherFormularioValido();

    const botaoSalvar = obterBotaoSalvar();
    expect(botaoSalvar.disabled).toBe(false);

    botaoSalvar.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fornecedorServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Skyline Tech Drones',
        cnpj: '12.345.678/0001-90',
        email: 'contato@skylinedrones.com.br',
      }),
    );
    expect(snackBarMock.open).toHaveBeenCalledWith('Fornecedor salvo com sucesso!', 'Ok', expect.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/admin/fornecedores']);
  });

  it('exibe mensagem de erro e redefine salvando quando create falha na API', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fornecedorServiceMock.create.mockReturnValue(throwError(() => ({ status: 500 })));

    await criarComponente();
    preencherFormularioValido();

    const botaoSalvar = obterBotaoSalvar();
    botaoSalvar.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.salvando).toBe(false);
    expect(botaoSalvar.disabled).toBe(false);
    expect(snackBarMock.open).toHaveBeenCalledWith('Erro ao salvar o fornecedor.', 'Ok', expect.any(Object));
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('carrega fornecedor em modo edição via snapshot.data["fornecedor"] e chama update', async () => {
    await criarComponente(fornecedorExistente);

    expect(fixture.nativeElement.textContent).toContain('Editar fornecedor');
    expect(component.form.controls['nome'].value).toBe('Fly Tech Distribuidora');
    expect(component.form.get('endereco.cidade.nome')?.value).toBe('Palmas');

    component.form.patchValue({ nome: 'Fly Tech Atualizada' });
    fixture.detectChanges();

    obterBotaoSalvar().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fornecedorServiceMock.update).toHaveBeenCalledWith(
      12,
      expect.objectContaining({
        id: 12,
        nome: 'Fly Tech Atualizada',
      }),
    );
    expect(fornecedorServiceMock.create).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/fornecedores']);
  });

  it('previne envio duplicado enquanto requisição está pendente', async () => {
    const pendente$ = new Subject<Fornecedor>();
    fornecedorServiceMock.create.mockReturnValue(pendente$.asObservable());

    await criarComponente();
    preencherFormularioValido();

    const botaoSalvar = obterBotaoSalvar();
    botaoSalvar.click();
    botaoSalvar.click();
    component.salvar();
    fixture.detectChanges();

    expect(fornecedorServiceMock.create).toHaveBeenCalledTimes(1);
    expect(component.salvando).toBe(true);
    expect(botaoSalvar.disabled).toBe(true);
    expect(botaoSalvar.textContent).toContain('Salvando...');

    pendente$.next(fornecedorExistente);
    pendente$.complete();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.salvando).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/fornecedores']);
  });

  it('abre confirmação via MatDialog em excluir() e só exclui quando confirmado', async () => {
    await criarComponente(fornecedorExistente);

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(false),
    });
    component.excluir();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Fornecedor',
        mensagem: 'Deseja realmente excluir o fornecedor "Fly Tech Distribuidora"?',
      },
    });
    expect(fornecedorServiceMock.delete).not.toHaveBeenCalled();

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(true),
    });
    component.excluir();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fornecedorServiceMock.delete).toHaveBeenCalledWith(12);
    expect(snackBarMock.open).toHaveBeenCalledWith('Fornecedor excluído com sucesso!', 'Ok', expect.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/admin/fornecedores']);
  });
});
