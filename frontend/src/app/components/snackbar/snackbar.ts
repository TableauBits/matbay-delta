import { Component, effect, inject } from '@angular/core';
import { SnackbarService, SnackbarType } from '../../services/snackbar';

@Component({
  selector: 'app-snackbar',
  imports: [],
  templateUrl: './snackbar.html',
  styleUrl: './snackbar.scss',
})
export class SnackbarComponent {
  private snackbarService = inject(SnackbarService);

  readonly snackbar = this.snackbarService.snackbar;
  readonly isExiting = this.snackbarService.isExiting;

  constructor() {
    // Log errors to console so developers can debug
    effect(() => {
      const sb = this.snackbar();
      if (sb?.type === 'error') {
        console.error(sb.message);
      }
    });
  }

  get icon(): string {
    return this.snackbar()?.type === 'success' ? '✓' : '✕';
  }

  get type(): SnackbarType | undefined {
    return this.snackbar()?.type;
  }

  dismiss(): void {
    this.snackbarService.dismiss();
  }
}
