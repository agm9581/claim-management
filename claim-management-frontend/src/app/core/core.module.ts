import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ClaimApiService } from './services/claim-api.service';
import { DamageApiService } from './services/damage-api.service';

@NgModule({
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
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
