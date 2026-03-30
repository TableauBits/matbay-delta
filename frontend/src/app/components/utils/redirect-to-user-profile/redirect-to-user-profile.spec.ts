import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectToUserProfile } from './redirect-to-user-profile';

describe('RedirectToUserProfile', () => {
  let component: RedirectToUserProfile;
  let fixture: ComponentFixture<RedirectToUserProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirectToUserProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectToUserProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
