import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstitutionPage } from './constitution-page';

describe('ConstitutionPage', () => {
  let component: ConstitutionPage;
  let fixture: ComponentFixture<ConstitutionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstitutionPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstitutionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
