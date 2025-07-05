import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeltaAuth } from './services/delta-auth';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'MATBay Δ';
  deltaAuth = inject(DeltaAuth);
}
