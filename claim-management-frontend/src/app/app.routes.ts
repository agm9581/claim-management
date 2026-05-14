import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'claims'
  },
  {
    path: 'claims',
    loadChildren: () =>
      import('./features/claims/claims.module').then((module) => module.ClaimsModule)
  },
  {
    path: '**',
    redirectTo: 'claims'
  }
];
