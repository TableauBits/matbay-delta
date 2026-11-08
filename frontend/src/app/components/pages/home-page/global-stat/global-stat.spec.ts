import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalStat } from './global-stat';

describe('GlobalStat', () => {
  let component: GlobalStat;
  let fixture: ComponentFixture<GlobalStat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalStat],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalStat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
