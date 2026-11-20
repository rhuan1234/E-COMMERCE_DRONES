import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Administrador } from '../../../../core/models/administrador/Administrado';
import { AdministradorService } from '../../../../core/services/AdministradorService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { AdministradorForm } from './administrador-form';

describe('AdministradorForm', () => {
  let component: AdministradorForm;
  let fixture: ComponentFixture<AdministradorForm>;
  let routeData: { administrador?: Administrador };
  let administradorServiceMock: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  const adminExistente: Administrador = {
    id: 7,
    login: 'carlos.admin',
    email: 'carlos@skyline.com',
    perfil: 'ADMIN',
  };

  function obterBotaoSalvar(): HTMLButtonElement {
    const botoes = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const botao = botoes.find(
      (btn) => btn.textContent?.includes('Salvar administrador') || btn.textContent?.includes('Salvando...'),
    );
    if (!botao) {
      throw new Error('Botão de salvar administrador não encontrado');
    }
    return botao;
  }

  function preencherFormularioValido(): void {
    component.form.patchValue({
      login: 'novo.admin',
      email: 'novo.admin@skyline.com',
      senha: 'senhaSegura123',
      perfil: 'ADMIN',
    });
  }

  beforeEach(async () => {
    routeData = {};
    administradorServiceMock = {
      create: vi.fn().mockReturnValue(of(adminExistente)),
      update: vi.fn().mockReturnValue(of(adminExistente)),
      delete: vi.fn().mockReturnValue(of(undefined)),
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
      imports: [AdministradorForm],
      providers: [
        provideRouter([]),
        { provide: AdministradorService, useValue: administradorServiceMock },
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

  async function criarComponente(administrador?: Administrador): Promise<void> {
    routeData.administrador = administrador;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(AdministradorForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza cabeçalho de criação e mantém botão de submit desabilitado quando inválido', async () => {
    await criarComponente();

    expect(fixture.nativeElement.textContent).toContain('Novo administrador');
    const botaoSalvar = obterBotaoSalvar();
    expect(botaoSalvar.disabled).toBe(true);
    expect(botaoSalvar.textContent).toContain('Salvar administrador');
  });

  it('valida regras de login, email e senha e exibe mensagens de erro', async () => {
    await criarComponente();

    const loginCtrl = component.form.controls['login'];
    const emailCtrl = component.form.controls['email'];
    const senhaCtrl = component.form.controls['senha'];

    loginCtrl.setValue('ab');
    loginCtrl.markAsTouched();
    emailCtrl.setValue('email-invalido');
    emailCtrl.markAsTouched();
    senhaCtrl.setValue('123');
    senhaCtrl.markAsTouched();
    fixture.detectChanges();

    expect(loginCtrl.hasError('minlength')).toBe(true);
    expect(emailCtrl.hasError('email')).toBe(true);
    expect(senhaCtrl.hasError('minlength')).toBe(true);
    expect(component.form.invalid).toBe(true);

    const textoDom = fixture.nativeElement.textContent as string;
    expect(textoDom).toContain('O login deve ter entre 3 e 40 caracteres.');
    expect(textoDom).toContain('Informe um e-mail válido.');
    expect(textoDom).toContain('A senha deve ter pelo menos 6 caracteres.');

    loginCtrl.setValue('com espaco');
    fixture.detectChanges();
    expect(loginCtrl.hasError('pattern')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('O login não pode conter espaços.');

    component.salvar();
    expect(administradorServiceMock.create).not.toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Preencha todos os campos obrigatórios.',
      'Ok',
      expect.any(Object),
    );
  });

  it('chama AdministradorService.create e navega para /admin/administradores ao criar administrador válido', async () => {
    await criarComponente();
    preencherFormularioValido();
    fixture.detectChanges();

    const botaoSalvar = obterBotaoSalvar();
    expect(botaoSalvar.disabled).toBe(false);

    botaoSalvar.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administradorServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        login: 'novo.admin',
        email: 'novo.admin@skyline.com',
        senha: 'senhaSegura123',
        perfil: 'ADMIN',
      }),
    );
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Administrador salvo com sucesso!',
      'Ok',
      expect.any(Object),
    );
    expect(router.navigate).toHaveBeenCalledWith(['/admin/administradores']);
  });

  it('carrega dados em modo edição, exibe título Editar administrador e chama update ao salvar', async () => {
    await criarComponente(adminExistente);

    expect(fixture.nativeElement.textContent).toContain('Editar administrador');
    expect(component.form.controls['login'].value).toBe('carlos.admin');
    expect(component.form.controls['email'].value).toBe('carlos@skyline.com');

    component.form.patchValue({ senha: 'novaSenha123' });
    fixture.detectChanges();

    obterBotaoSalvar().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administradorServiceMock.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        id: 7,
        login: 'carlos.admin',
        email: 'carlos@skyline.com',
        senha: 'novaSenha123',
      }),
    );
    expect(administradorServiceMock.create).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/administradores']);
  });

  it('previne envio duplicado enquanto a requisição está pendente e exibe Salvando...', async () => {
    const pendente$ = new Subject<Administrador>();
    administradorServiceMock.create.mockReturnValue(pendente$.asObservable());

    await criarComponente();
    preencherFormularioValido();
    fixture.detectChanges();

    const botaoSalvar = obterBotaoSalvar();
    botaoSalvar.click();
    botaoSalvar.click();
    component.salvar();
    fixture.detectChanges();

    expect(administradorServiceMock.create).toHaveBeenCalledTimes(1);
    expect(component.salvando).toBe(true);
    expect(botaoSalvar.disabled).toBe(true);
    expect(botaoSalvar.textContent).toContain('Salvando...');

    pendente$.next(adminExistente);
    pendente$.complete();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.salvando).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/administradores']);
  });

  it('exibe feedback de erro da API e reabilita o envio quando create falha', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    administradorServiceMock.create.mockReturnValue(throwError(() => ({ status: 500 })));

    await criarComponente();
    preencherFormularioValido();
    fixture.detectChanges();

    const botaoSalvar = obterBotaoSalvar();
    botaoSalvar.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.salvando).toBe(false);
    expect(botaoSalvar.disabled).toBe(false);
    expect(botaoSalvar.textContent).toContain('Salvar administrador');
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Erro ao salvar o administrador.',
      'Ok',
      expect.any(Object),
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('abre diálogo de confirmação em excluir() e só exclui quando confirmado', async () => {
    await criarComponente(adminExistente);

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(false),
    });
    component.excluir();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogMock.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Administrador',
        mensagem: 'Deseja realmente excluir o administrador "carlos.admin"?',
      },
    });
    expect(administradorServiceMock.delete).not.toHaveBeenCalled();

    dialogMock.open.mockReturnValueOnce({
      afterClosed: () => of(true),
    });
    component.excluir();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administradorServiceMock.delete).toHaveBeenCalledWith(7);
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Administrador excluído com sucesso!',
      'Ok',
      expect.any(Object),
    );
    expect(router.navigate).toHaveBeenCalledWith(['/admin/administradores']);
  });
});
