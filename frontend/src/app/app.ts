import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeltaAuth } from './services/delta-auth';
import { Version } from './services/version';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Service injections
  deltaAuth = inject(DeltaAuth);
  version = inject(Version);
}
