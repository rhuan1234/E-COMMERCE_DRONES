import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth/AuthService';
import { Register } from './register';

describe('Register', () => {
  const authService = {
    register: vi.fn(),
    login: vi.fn(),
    destinoPadrao: vi.fn().mockReturnValue('/home'),
  };

  async function criar(): Promise<ComponentFixture<Register>> {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  async function enviar(fixture: ComponentFixture<Register>): Promise<void> {
    fixture.componentInstance.form.setValue({ login: 'novo', email: 'novo@exemplo.com', senha: 'segredo1' });
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    authService.register.mockReset();
    authService.login.mockReset();
  });

  it('creates the account, signs in and goes to the default destination', async () => {
    authService.register.mockReturnValue(of({}));
    authService.login.mockReturnValue(of({ token: 'x' }));
    const fixture = await criar();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await enviar(fixture);

    expect(authService.register).toHaveBeenCalledWith({ login: 'novo', senha: 'segredo1', email: 'novo@exemplo.com' });
    expect(authService.login).toHaveBeenCalledWith({ login: 'novo', senha: 'segredo1' });
    expect(navegar).toHaveBeenCalledWith('/home');
  });

  it('shows API validation errors on the matching fields', async () => {
    authService.register.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              success: false,
              message: 'Os dados informados são inválidos.',
              error: { code: 'VALIDATION_ERROR', details: [{ field: 'login', issue: 'Login já cadastrado.' }] },
            },
          }),
      ),
    );
    const fixture = await criar();
    await enviar(fixture);

    expect(fixture.nativeElement.querySelector('#login-erro').textContent).toContain('Login já cadastrado.');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Os dados informados são inválidos.');
    expect(authService.login).not.toHaveBeenCalled();
  });
});
