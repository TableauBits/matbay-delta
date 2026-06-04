import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectToSongPage } from './redirect-to-song-page';

describe('RedirectToSongPage', () => {
  let component: RedirectToSongPage;
  let fixture: ComponentFixture<RedirectToSongPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirectToSongPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectToSongPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
