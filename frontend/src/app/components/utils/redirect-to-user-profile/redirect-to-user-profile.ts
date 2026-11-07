import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../../../../../common/user';

@Component({
  selector: 'app-redirect-to-user-profile',
  imports: [RouterLink],
  templateUrl: './redirect-to-user-profile.html',
})
export class RedirectToUserProfile {
  user = input<User | null>();
  imgWidth = input<number>();
  imgHeight = input<number>();
  showName = input<boolean>(true);
  showProfilePreview = input<boolean>(true);

  previewVisible = signal(false);
  previewLeft = signal(0);
  previewTop = signal(0);
  previewAbove = signal(false);

  private previewTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.previewTimer));
  }

  schedulePreview(event: Event): void {
    if (!this.showProfilePreview()) return;
    const target = event.currentTarget as HTMLElement;
    clearTimeout(this.previewTimer);
    this.previewTimer = setTimeout(() => this.showPreview(target), 400);
  }

  showPreviewOnFocus(event: Event): void {
    if (!this.showProfilePreview()) return;
    clearTimeout(this.previewTimer);
    this.showPreview(event.currentTarget as HTMLElement);
  }

  private showPreview(target: HTMLElement): void {
    const rect = target.getBoundingClientRect();
    const width = Math.min(288, window.innerWidth - 16);
    this.previewLeft.set(Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)));
    const above = window.innerHeight - rect.bottom < 340 && rect.top > window.innerHeight - rect.bottom;
    this.previewAbove.set(above);
    this.previewTop.set(above ? rect.top - 8 : rect.bottom + 8);
    this.previewVisible.set(true);
  }

  hidePreview(): void {
    clearTimeout(this.previewTimer);
    this.previewVisible.set(false);
  }
}
