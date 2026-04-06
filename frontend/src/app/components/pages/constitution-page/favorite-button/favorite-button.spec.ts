import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteButton } from './favorite-button';

describe('FavoriteButton', () => {
  let component: FavoriteButton;
  let fixture: ComponentFixture<FavoriteButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteButton],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
