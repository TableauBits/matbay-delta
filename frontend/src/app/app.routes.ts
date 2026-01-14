import { Routes } from '@angular/router';
import { CurrentConstitutionsPage } from './components/pages/current-constitutions-page/current-constitutions-page';
import { HomePage } from './components/pages/home-page/home-page';
import { ConstitutionPage } from './components/pages/constitution-page/constitution-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'constitutions/:id',
    component: ConstitutionPage,
  },
  {
    path: 'current-constitutions',
    component: CurrentConstitutionsPage,
  }
];
