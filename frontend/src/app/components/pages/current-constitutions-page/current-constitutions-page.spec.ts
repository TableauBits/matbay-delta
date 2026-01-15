import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentConstitutionsPage } from './current-constitutions-page';

describe('CurrentConstitutionsPage', () => {
  let component: CurrentConstitutionsPage;
  let fixture: ComponentFixture<CurrentConstitutionsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentConstitutionsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentConstitutionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
