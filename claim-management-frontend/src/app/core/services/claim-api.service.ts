import type { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Claim, UpdateClaimRequest } from '../../types/claim.types';

export class ClaimApiService {
  private readonly endpoint = `${environment.apiBaseUrl}/claims`;

  constructor(private readonly http: HttpClient) {}

  listClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(this.endpoint);
  }

  getClaimById(claimId: string): Observable<Claim> {
    return this.http.get<Claim>(`${this.endpoint}/${claimId}`);
  }

  updateClaim(claimId: string, payload: UpdateClaimRequest): Observable<Claim> {
    return this.http.patch<Claim>(`${this.endpoint}/${claimId}`, payload);
  }
}
