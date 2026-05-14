import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ClaimApiService } from './services/claim-api.service';
import { DamageApiService } from './services/damage-api.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    {
      provide: ClaimApiService,
      useFactory: (httpClient: HttpClient) => new ClaimApiService(httpClient),
      deps: [HttpClient]
    },
    {
      provide: DamageApiService,
      useFactory: (httpClient: HttpClient) => new DamageApiService(httpClient),
      deps: [HttpClient]
    }
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule should only be imported once.');
    }
  }
}
