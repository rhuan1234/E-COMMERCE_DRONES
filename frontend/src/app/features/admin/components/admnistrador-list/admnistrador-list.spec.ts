import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdmnistradorList } from './admnistrador-list';

describe('AdmnistradorList', () => {
  let component: AdmnistradorList;
  let fixture: ComponentFixture<AdmnistradorList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmnistradorList],
    }).compileComponents();

    fixture = TestBed.createComponent(AdmnistradorList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
