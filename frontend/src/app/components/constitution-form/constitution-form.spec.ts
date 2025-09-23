import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstitutionForm } from './constitution-form';

describe('ConstitutionForm', () => {
  let component: ConstitutionForm;
  let fixture: ComponentFixture<ConstitutionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstitutionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstitutionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
