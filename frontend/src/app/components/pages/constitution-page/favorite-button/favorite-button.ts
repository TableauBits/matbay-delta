import { Component, input } from '@angular/core';

@Component({
  selector: 'app-favorite-button',
  imports: [],
  templateUrl: './favorite-button.html',
  styleUrl: './favorite-button.scss',
})
export class FavoriteButton {
  songConstitution = input<number>();

  isFavorite(): boolean {
    return true;
  }

  addFavorite(): void {
    console.log('Adding to favorites');
  }

  removeFavorite(): void {
    console.log('Removing from favorites');
  }
}
