import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentUserForm } from './current-user-form';

describe('CurrentUserForm', () => {
  let component: CurrentUserForm;
  let fixture: ComponentFixture<CurrentUserForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentUserForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentUserForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
