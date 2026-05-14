import type { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateDamageRequest,
  Damage,
  UpdateDamageRequest
} from '../../types/damage.types';

export class DamageApiService {
  private readonly claimsEndpoint = `${environment.apiBaseUrl}/claims`;

  constructor(private readonly http: HttpClient) {}

  listDamagesByClaimId(claimId: string): Observable<Damage[]> {
    return this.http.get<Damage[]>(`${this.claimsEndpoint}/${claimId}/damages`);
  }

  createDamage(claimId: string, payload: CreateDamageRequest): Observable<Damage> {
    return this.http.post<Damage>(`${this.claimsEndpoint}/${claimId}/damages`, payload);
  }

  updateDamage(
    claimId: string,
    damageId: string,
    payload: UpdateDamageRequest
  ): Observable<Damage> {
    return this.http.patch<Damage>(
      `${this.claimsEndpoint}/${claimId}/damages/${damageId}`,
      payload
    );
  }

  deleteDamage(claimId: string, damageId: string): Observable<void> {
    return this.http.delete<void>(`${this.claimsEndpoint}/${claimId}/damages/${damageId}`);
  }
}
