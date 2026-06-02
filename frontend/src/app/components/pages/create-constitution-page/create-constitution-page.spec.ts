import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateConstitutionPage } from './create-constitution-page';

describe('CreateConstitutionPage', () => {
  let component: CreateConstitutionPage;
  let fixture: ComponentFixture<CreateConstitutionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateConstitutionPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateConstitutionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
