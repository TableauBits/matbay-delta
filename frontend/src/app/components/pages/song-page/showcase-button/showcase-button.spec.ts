import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowcaseButton } from './showcase-button';
import { Users } from '../../../../services/users';
import { DeltaAuth } from '../../../../services/delta-auth';

describe('ShowcaseButton', () => {
  let fixture: ComponentFixture<ShowcaseButton>;
  let users: jasmine.SpyObj<Users>;

  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    users = jasmine.createSpyObj<Users>('Users', ['getShowcase', 'addSongShowcase']);
    users.getShowcase.and.resolveTo([]);
    users.addSongShowcase.and.resolveTo({});
    await TestBed.configureTestingModule({
      imports: [ShowcaseButton],
      providers: [
        { provide: Users, useValue: users },
        { provide: DeltaAuth, useValue: { getUid: () => Promise.resolve('owner') } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ShowcaseButton);
    fixture.componentRef.setInput('songId', 42);
  });

  it('adds the song and disables duplicate additions', async () => {
    await render();
    fixture.nativeElement.querySelector('button').click();
    await render();
    expect(users.getShowcase).toHaveBeenCalledWith('owner');
    expect(users.addSongShowcase).toHaveBeenCalledOnceWith(42);
    expect(fixture.nativeElement.querySelector('button').disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Showcased');
    await fixture.componentInstance.add();
    expect(users.addSongShowcase).toHaveBeenCalledTimes(1);
  });

  it('disables the button if the song is already showcased', async () => {
    users.getShowcase.and.resolveTo([{ id: 7, user: 'owner', song: 42, addDate: '' }]);
    await render();
    expect(fixture.nativeElement.querySelector('button').disabled).toBeTrue();
    await fixture.componentInstance.add();
    expect(users.addSongShowcase).not.toHaveBeenCalled();
  });

  it('allows retrying a failed addition', async () => {
    users.addSongShowcase.and.rejectWith(new Error('offline'));
    await render();
    await fixture.componentInstance.add();
    await render();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Unable to showcase');
    expect(fixture.nativeElement.querySelector('button').disabled).toBeFalse();
    users.addSongShowcase.and.resolveTo({});
    await fixture.componentInstance.add();
    await render();
    expect(fixture.componentInstance.showcased()).toBeTrue();
  });

  it('updates the status when navigating to another song', async () => {
    users.getShowcase.and.resolveTo([{ id: 7, user: 'owner', song: 42, addDate: '' }]);
    await render();
    fixture.componentRef.setInput('songId', 43);
    await render();
    expect(fixture.nativeElement.querySelector('button').disabled).toBeFalse();
    expect(fixture.componentInstance.showcased()).toBeFalse();
  });
});
