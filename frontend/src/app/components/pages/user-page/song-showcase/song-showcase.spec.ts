import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SongShowcase } from './song-showcase';
import { Users } from '../../../../services/users';
import { Songs } from '../../../../services/songs';
import { Artists } from '../../../../services/artists';
import { SourcePlatform } from '../../../../../../../common/source';

describe('SongShowcase', () => {
  let fixture: ComponentFixture<SongShowcase>;
  let users: jasmine.SpyObj<Users>;

  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    users = jasmine.createSpyObj<Users>('Users', ['getShowcase', 'deleteSongShowcase']);
    users.getShowcase.and.resolveTo([{ id: 7, user: 'owner', song: 42, addDate: '2026-01-01' }]);
    users.deleteSongShowcase.and.resolveTo({});
    await TestBed.configureTestingModule({
      imports: [SongShowcase],
      providers: [
        provideRouter([]),
        { provide: Users, useValue: users },
        {
          provide: Songs,
          useValue: {
            get: () =>
              of({
                id: 42,
                title: 'Test song',
                primaryArtist: 3,
                songSource: [{ platform: SourcePlatform.YOUTUBE, sourceID: 'video' }],
              }),
          },
        },
        { provide: Artists, useValue: { get: () => of({ name: 'Test artist' }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SongShowcase);
    fixture.componentRef.setInput('uid', 'owner');
  });

  it('renders a DaisyUI list with a linked song, thumbnail and artist', async () => {
    await render();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('ul.list li.list-row')).not.toBeNull();
    expect(element.textContent).toContain('Test song');
    expect(element.textContent).toContain('Test artist');
    expect(element.querySelector('img')?.src).toContain('/vi/video/');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/songs/42');
    expect(element.querySelector('button')).toBeNull();
  });

  it('deletes by showcase ID and updates the list for the owner', async () => {
    fixture.componentRef.setInput('editable', true);
    await render();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toContain('Remove Test song');
    expect(button.querySelector('svg')).not.toBeNull();
    button.click();
    await render();
    expect(users.deleteSongShowcase).toHaveBeenCalledOnceWith(7);
    expect(fixture.nativeElement.textContent).toContain('No songs showcased yet.');
  });

  it('does not allow removal on another profile', async () => {
    await render();
    await fixture.componentInstance.remove(7);
    expect(users.deleteSongShowcase).not.toHaveBeenCalled();
  });

  it('keeps the song and reports a failed deletion', async () => {
    users.deleteSongShowcase.and.rejectWith(new Error('offline'));
    fixture.componentRef.setInput('editable', true);
    await render();
    await fixture.componentInstance.remove(7);
    await render();
    expect(fixture.nativeElement.textContent).toContain('Test song');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Unable to remove');
  });

  it('reports load failures and supports retry', async () => {
    users.getShowcase.and.rejectWith(new Error('offline'));
    await render();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    users.getShowcase.and.resolveTo([]);
    fixture.componentInstance.retry();
    await render();
    expect(fixture.nativeElement.textContent).toContain('No songs showcased yet.');
  });

  it('ignores a stale response after changing profiles', async () => {
    let resolveOld!: (entries: []) => void;
    users.getShowcase.and.returnValue(
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
    );
    fixture.detectChanges();
    users.getShowcase.and.resolveTo([{ id: 8, user: 'other', song: 42, addDate: '' }]);
    fixture.componentRef.setInput('uid', 'other');
    await render();
    resolveOld([]);
    await render();
    expect(fixture.nativeElement.textContent).toContain('Test song');
  });
});
