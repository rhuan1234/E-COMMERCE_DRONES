import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminLayoutComponent } from './admin-layout';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { PerfilService } from '../../../../core/services/PerfilService';

describe('AdminLayoutComponent', () => {
  let component: AdminLayoutComponent;
  let fixture: ComponentFixture<AdminLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { logout: () => {} },
        },
        {
          provide: PerfilService,
          useValue: { obterPerfil: () => of({ email: 'admin@skyline.com' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with sidebar expanded and toggle collapsed state when clicking menu button', () => {
    expect(component.isCollapsed()).toBe(false);

    const toggleBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.toggle-sidebar-btn');
    expect(toggleBtn).toBeTruthy();

    toggleBtn?.click();
    fixture.detectChanges();
    expect(component.isCollapsed()).toBe(true);
    expect(fixture.nativeElement.querySelector('.admin-sidenav.collapsed')).toBeTruthy();

    toggleBtn?.click();
    fixture.detectChanges();
    expect(component.isCollapsed()).toBe(false);
    expect(fixture.nativeElement.querySelector('.admin-sidenav.collapsed')).toBeFalsy();
  });
});
