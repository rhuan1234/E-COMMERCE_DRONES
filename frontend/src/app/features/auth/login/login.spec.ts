import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth/AuthService';
import { Login } from './login';

describe('Login', () => {
  const authService = {
    login: vi.fn(),
    destinoPadrao: vi.fn().mockReturnValue('/home'),
  };

  async function criar(): Promise<ComponentFixture<Login>> {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  function preencher(fixture: ComponentFixture<Login>): void {
    fixture.componentInstance.form.setValue({ login: 'cliente', senha: 'segredo1' });
  }

  async function enviar(fixture: ComponentFixture<Login>): Promise<void> {
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    authService.login.mockReset();
  });

  it('shows field messages and does not call the API when the form is empty', async () => {
    const fixture = await criar();
    await enviar(fixture);

    expect(authService.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('#login-erro').textContent).toContain('Informe seu login.');
    expect(fixture.nativeElement.querySelector('#senha-erro').textContent).toContain('Informe sua senha.');
  });

  it('navigates to the default destination after a successful login', async () => {
    authService.login.mockReturnValue(of({ token: 'x' }));
    const fixture = await criar();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    preencher(fixture);
    await enviar(fixture);

    expect(authService.login).toHaveBeenCalledWith({ login: 'cliente', senha: 'segredo1' });
    expect(navegar).toHaveBeenCalledWith('/home');
  });

  it('tells the user when the credentials are wrong', async () => {
    authService.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const fixture = await criar();
    preencher(fixture);
    await enviar(fixture);

    const alerta = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    expect(alerta.textContent).toContain('Login ou senha incorretos.');
  });

  it('blocks a second submit while the first one is running', async () => {
    const resposta = new Subject<unknown>();
    authService.login.mockReturnValue(resposta);
    const fixture = await criar();
    preencher(fixture);
    await enviar(fixture);
    await enviar(fixture);

    expect(authService.login).toHaveBeenCalledTimes(1);
    const botao = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(botao.disabled).toBe(true);
    expect(botao.textContent).toContain('Entrando');
  });
});
