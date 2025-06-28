import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DeltaAuth } from './services/delta-auth';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'MATBay Δ';

  constructor(public deltaAuth: DeltaAuth) {}
}
