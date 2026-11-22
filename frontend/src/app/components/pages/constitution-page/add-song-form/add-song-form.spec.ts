import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSongForm } from './add-song-form';

describe('AddSongForm', () => {
  let component: AddSongForm;
  let fixture: ComponentFixture<AddSongForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSongForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSongForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept a valid release year', () => {
    const releaseYear = component.songForm.get('releaseYear');

    releaseYear?.setValue(2026);

    expect(releaseYear?.valid).toBeTrue();
  });

  it('should reject an invalid release year', () => {
    const releaseYear = component.songForm.get('releaseYear');

    releaseYear?.setValue(26);

    expect(releaseYear?.invalid).toBeTrue();
  });
});
