import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ClaimsRoutingModule } from './claims-routing.module';
import { ClaimListComponent } from './pages/claim-list/claim-list.component';
import { ClaimDetailComponent } from './pages/claim-detail/claim-detail.component';

@NgModule({
  declarations: [ClaimListComponent, ClaimDetailComponent],
  imports: [SharedModule, ClaimsRoutingModule]
})
export class ClaimsModule {}
