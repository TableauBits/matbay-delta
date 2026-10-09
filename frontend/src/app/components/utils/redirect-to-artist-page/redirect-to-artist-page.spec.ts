import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectToArtistPage } from './redirect-to-artist-page';

describe('RedirectToArtistPage', () => {
  let component: RedirectToArtistPage;
  let fixture: ComponentFixture<RedirectToArtistPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirectToArtistPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectToArtistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
