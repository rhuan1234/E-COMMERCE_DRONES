import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DroneList } from './drone-list';

describe('DroneList', () => {
  let component: DroneList;
  let fixture: ComponentFixture<DroneList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneList],
    }).compileComponents();

    fixture = TestBed.createComponent(DroneList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
