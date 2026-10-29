import { environment } from '../environments/environment';
import { HomePage } from './components/pages/home-page/home-page';
import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    title: 'Matbay Δ',
  },
  {
    path: 'artists/:id',
    loadComponent: () => import('./components/pages/artist-page/artist-page').then((m) => m.ArtistPage),
  },
  {
    path: 'constitutions/:id',
    loadComponent: () =>
      import('./components/pages/constitution-page/constitution-page').then((m) => m.ConstitutionPage),
  },
  {
    path: 'create-constitution',
    loadComponent: () =>
      import('./components/pages/create-constitution-page/create-constitution-page').then(
        (m) => m.CreateConstitutionPage,
      ),
    title: 'Create a constitution',
  },
  {
    path: 'current-constitutions',
    loadComponent: () =>
      import('./components/pages/current-constitutions-page/current-constitutions-page').then(
        (m) => m.CurrentConstitutionsPage,
      ),
    title: 'Current constitutions',
  },
  {
    path: 'songs/:id',
    loadComponent: () => import('./components/pages/song-page/song-page').then((m) => m.SongPage),
  },
  {
    path: 'users/:handle',
    loadComponent: () => import('./components/pages/user-page/user-page').then((m) => m.UserPage),
  },
];

if (environment.name === 'development') {
  routes.push({
    path: 'debug',
    loadComponent: () => import('./components/pages/debug-page/debug-page').then((m) => m.DebugPage),
    title: 'Δ-Debug',
  });
}

export { routes };
