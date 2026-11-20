import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AtualizarPerfilRequest } from '../../../../core/models/perfil/AtualizarPerfilRequest';
import { PerfilUsuario } from '../../../../core/models/perfil/PerfilUsuario';
import { PerfilService } from '../../../../core/services/PerfilService';
import { PerfilPage } from './perfil-page';

describe('PerfilPage', () => {
  let component: PerfilPage;
  let fixture: ComponentFixture<PerfilPage>;
  let perfilServiceMock: {
    obterPerfil: ReturnType<typeof vi.fn>;
    atualizarPerfil: ReturnType<typeof vi.fn>;
  };

  const perfilInicial: PerfilUsuario = {
    login: 'admin.master',
    nomeCompleto: 'Ana Paula Silva',
    email: 'ana.silva@skyline.com',
    cpf: '123.456.789-00',
    telefone: '(63) 99999-1111',
  };

  function obterBotaoSalvar(): HTMLButtonElement {
    const botao = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    if (!botao) {
      throw new Error('Botão salvar alterações não encontrado');
    }
    return botao;
  }

  beforeEach(async () => {
    perfilServiceMock = {
      obterPerfil: vi.fn().mockReturnValue(of(perfilInicial)),
      atualizarPerfil: vi.fn().mockReturnValue(of(perfilInicial)),
    };

    await TestBed.configureTestingModule({
      imports: [PerfilPage],
      providers: [provideRouter([]), { provide: PerfilService, useValue: perfilServiceMock }],
    }).compileComponents();
  });

  async function criarComponente(): Promise<void> {
    fixture = TestBed.createComponent(PerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('carrega perfil via obterPerfil(), mantém login/email desabilitados e campos editáveis preenchidos', async () => {
    await criarComponente();

    expect(perfilServiceMock.obterPerfil).toHaveBeenCalledTimes(1);
    expect(component.carregando).toBe(false);

    expect(component.perfilForm.controls.login.disabled).toBe(true);
    expect(component.perfilForm.controls.email.disabled).toBe(true);
    expect(component.perfilForm.controls.login.value).toBe('admin.master');
    expect(component.perfilForm.controls.email.value).toBe('ana.silva@skyline.com');

    expect(component.perfilForm.controls.nomeCompleto.enabled).toBe(true);
    expect(component.perfilForm.controls.cpf.enabled).toBe(true);
    expect(component.perfilForm.controls.telefone.enabled).toBe(true);
    expect(component.perfilForm.controls.nomeCompleto.value).toBe('Ana Paula Silva');
    expect(component.perfilForm.controls.cpf.value).toBe('123.456.789-00');
    expect(component.perfilForm.controls.telefone.value).toBe('(63) 99999-1111');

    const loginInput = fixture.nativeElement.querySelector('input[formControlName="login"]') as HTMLInputElement;
    const emailInput = fixture.nativeElement.querySelector('input[formControlName="email"]') as HTMLInputElement;
    expect(loginInput.disabled).toBe(true);
    expect(emailInput.disabled).toBe(true);
  });

  it('exibe alerta de erro e botão tentar novamente quando obterPerfil() falha', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    perfilServiceMock.obterPerfil.mockReturnValueOnce(throwError(() => ({ status: 500 })));

    await criarComponente();

    expect(component.carregando).toBe(false);
    expect(component.erroCarregamento).toBe('Não foi possível carregar seus dados.');

    const alerta = fixture.nativeElement.querySelector('.alerta-erro') as HTMLElement | null;
    expect(alerta?.textContent).toContain('Não foi possível carregar seus dados.');

    const btnTentarNovamente = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.includes('Tentar novamente'));
    expect(btnTentarNovamente).toBeDefined();

    perfilServiceMock.obterPerfil.mockReturnValueOnce(of(perfilInicial));
    btnTentarNovamente?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(perfilServiceMock.obterPerfil).toHaveBeenCalledTimes(2);
    expect(component.erroCarregamento).toBe('');
    expect(component.perfilForm.controls.nomeCompleto.value).toBe('Ana Paula Silva');
  });

  it('valida nomeCompleto, cpf e telefone e bloqueia envio quando inválido', async () => {
    await criarComponente();

    component.perfilForm.patchValue({
      nomeCompleto: 'A',
      cpf: '123',
      telefone: '999',
    });
    component.salvarPerfil();
    fixture.detectChanges();

    expect(component.perfilForm.invalid).toBe(true);
    expect(component.perfilForm.controls.nomeCompleto.hasError('minlength')).toBe(true);
    expect(component.perfilForm.controls.cpf.hasError('pattern')).toBe(true);
    expect(component.perfilForm.controls.telefone.hasError('pattern')).toBe(true);
    expect(perfilServiceMock.atualizarPerfil).not.toHaveBeenCalled();

    const textoDom = fixture.nativeElement.textContent as string;
    expect(textoDom).toContain('O nome deve ter entre 2 e 120 caracteres.');
    expect(textoDom).toContain('Informe um CPF com 11 dígitos.');
    expect(textoDom).toContain('Informe um telefone válido com DDD.');
  });

  it('chama atualizarPerfil() com dados válidos e exibe alerta de sucesso', async () => {
    const dadosAtualizados: AtualizarPerfilRequest = {
      nomeCompleto: 'Ana Paula Souza',
      cpf: '98765432100',
      telefone: '(63) 98888-7777',
    };
    const perfilAtualizado: PerfilUsuario = {
      ...perfilInicial,
      ...dadosAtualizados,
    };
    perfilServiceMock.atualizarPerfil.mockReturnValue(of(perfilAtualizado));

    await criarComponente();
    component.perfilForm.patchValue(dadosAtualizados);
    fixture.detectChanges();

    obterBotaoSalvar().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(perfilServiceMock.atualizarPerfil).toHaveBeenCalledWith(dadosAtualizados);
    const alertaSucesso = fixture.nativeElement.querySelector('.alerta-sucesso') as HTMLElement | null;
    expect(alertaSucesso?.textContent).toContain('Dados atualizados com sucesso!');
  });

  it('previne envio duplicado enquanto atualizarPerfil() está pendente', async () => {
    const pendente$ = new Subject<PerfilUsuario>();
    perfilServiceMock.atualizarPerfil.mockReturnValue(pendente$.asObservable());

    await criarComponente();

    const botaoSalvar = obterBotaoSalvar();
    botaoSalvar.click();
    botaoSalvar.click();
    component.salvarPerfil();
    fixture.detectChanges();

    expect(perfilServiceMock.atualizarPerfil).toHaveBeenCalledTimes(1);
    expect(component.salvando).toBe(true);
    expect(botaoSalvar.disabled).toBe(true);
    expect(botaoSalvar.textContent).toContain('Salvando...');

    pendente$.next(perfilInicial);
    pendente$.complete();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.salvando).toBe(false);
    expect(botaoSalvar.disabled).toBe(false);
  });

  it('exibe alerta de erro quando atualizarPerfil() falha', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    perfilServiceMock.atualizarPerfil.mockReturnValue(
      throwError(() => ({
        status: 400,
        error: { message: 'CPF já cadastrado para outro usuário.' },
      })),
    );

    await criarComponente();
    obterBotaoSalvar().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.salvando).toBe(false);
    const alertaErro = fixture.nativeElement.querySelector('.alerta-erro') as HTMLElement | null;
    expect(alertaErro?.textContent).toContain('CPF já cadastrado para outro usuário.');
  });
});
