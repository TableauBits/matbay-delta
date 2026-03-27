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
});
