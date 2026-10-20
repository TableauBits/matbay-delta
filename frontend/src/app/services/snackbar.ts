import { Injectable, signal } from '@angular/core';

export type SnackbarType = 'success' | 'error';

export interface SnackbarOptions {
  message: string;
  type: SnackbarType;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private currentSnackbar = signal<SnackbarOptions | null>(null);
  private exiting = signal(false);

  /** Returns the current snackbar as a signal (useful in templates with `async` or `signal`). */
  get snackbar() {
    return this.currentSnackbar.asReadonly();
  }

  /** Whether the snackbar is currently fading out. */
  get isExiting() {
    return this.exiting.asReadonly();
  }

  private dismissWithAnimation(): void {
    this.exiting.set(true);

    // Wait for the exit animation to complete, then remove
    setTimeout(() => {
      this.currentSnackbar.set(null);
      this.exiting.set(false);
    }, 300);
  }

  /** Show a snackbar and auto-dismiss after `duration`. */
  show(options: SnackbarOptions): void {
    const { duration = 4000, ...data } = options;

    // Dismiss any existing snackbar with animation first
    this.dismissWithAnimation();

    // Brief delay so the exit animation can play, then show the new one
    setTimeout(() => {
      this.currentSnackbar.set(data);
    }, 300);

    // Auto-dismiss
    setTimeout(() => {
      this.dismissWithAnimation();
    }, duration);
  }

  /** Convenience: show a success message. */
  showSuccess(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  /** Convenience: show an error message. */
  showError(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  /** Manually dismiss the current snackbar. */
  dismiss(): void {
    this.dismissWithAnimation();
  }
}
