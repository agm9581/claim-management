import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClaimListComponent } from './pages/claim-list/claim-list.component';
import { ClaimDetailComponent } from './pages/claim-detail/claim-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ClaimListComponent
  },
  {
    path: ':id',
    component: ClaimDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimsRoutingModule {}
