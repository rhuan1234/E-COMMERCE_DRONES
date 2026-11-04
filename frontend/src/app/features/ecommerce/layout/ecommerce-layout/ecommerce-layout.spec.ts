import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { EcommerceCatalogSearchService } from '../../../../core/services/EcommerceCatalogSearchService';
import { EcommerceLayout } from './ecommerce-layout';

describe('EcommerceLayout', () => {
  let component: EcommerceLayout;
  let fixture: ComponentFixture<EcommerceLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcommerceLayout],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EcommerceLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('submits the search term to the catalog and navigates to the home', () => {
    const router = TestBed.inject(Router);
    const search = TestBed.inject(EcommerceCatalogSearchService);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const searchSpy = vi.spyOn(search, 'search');
    const input = fixture.nativeElement.querySelector('#store-search') as HTMLInputElement;
    const form = fixture.nativeElement.querySelector('.search-form') as HTMLFormElement;

    input.value = '  Mavic  ';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(searchSpy).toHaveBeenCalledWith('Mavic');
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });
});
