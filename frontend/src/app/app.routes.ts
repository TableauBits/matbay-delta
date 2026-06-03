import { ConstitutionPage } from './components/pages/constitution-page/constitution-page';
import { CreateConstitutionPage } from './components/pages/create-constitution-page/create-constitution-page';
import { CurrentConstitutionsPage } from './components/pages/current-constitutions-page/current-constitutions-page';
import { HomePage } from './components/pages/home-page/home-page';
import { Routes } from '@angular/router';
import { UserPage } from './components/pages/user-page/user-page';

export const routes: Routes = [
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
