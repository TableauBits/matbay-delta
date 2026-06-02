import { ConstitutionPage } from './components/pages/constitution-page/constitution-page';
import { CreateConstitutionPage } from './components/pages/create-constitution-page/create-constitution-page';
import { CurrentConstitutionsPage } from './components/pages/current-constitutions-page/current-constitutions-page';
import { environment } from '../environments/environment';
import { HomePage } from './components/pages/home-page/home-page';
import { Routes } from '@angular/router';
import { UserPage } from './components/pages/user-page/user-page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    title: 'Matbay Δ',
  },
  {
    path: 'constitutions/:id',
    component: ConstitutionPage,
  },
  {
    path: 'create-constitution',
    component: CreateConstitutionPage,
    title: 'Create a constitution',
  },
  {
    path: 'current-constitutions',
    component: CurrentConstitutionsPage,
    title: 'Current constitutions',
  },
  {
    path: 'users/:handle',
    component: UserPage,
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
