import { describe, expect, it, jest } from '@jest/globals';
import type { DoneCallback } from '@jest/types';
import { of } from 'rxjs';
import type { HttpClient } from '@angular/common/http';
import { ClaimApiService } from './claim-api.service';
import type { Claim, UpdateClaimRequest } from '../../types/claim.types';

function createHttpClientMock() {
  return {
    get: jest.fn(),
    patch: jest.fn()
  } as unknown as jest.Mocked<Pick<HttpClient, 'get' | 'patch'>>;
}

describe('ClaimApiService', () => {
  const claimId = '6824d4d8c6f0c3a59748df11';

  it('requests the claim list from the claims endpoint', (done: DoneCallback) => {
    const httpClient = createHttpClientMock();
    const expectedClaims: Claim[] = [
      {
        _id: claimId,
        title: 'Rear bumper collision',
        description: 'Low speed parking impact with visible rear bumper damage.',
        status: 'Pending',
        totalAmount: 0,
        createdAt: '2026-05-15T00:00:00.000Z',
        updatedAt: '2026-05-15T00:00:00.000Z'
      }
    ];
    httpClient.get.mockReturnValue(of(expectedClaims));

    const service = new ClaimApiService(httpClient as unknown as HttpClient);

    service.listClaims().subscribe((claims) => {
      expect(httpClient.get).toHaveBeenCalledWith('http://localhost:3000/api/claims');
      expect(claims).toEqual(expectedClaims);
      done();
    });
  });

  it('requests a claim by id from the claim detail endpoint', (done: DoneCallback) => {
    const httpClient = createHttpClientMock();
    const expectedClaim: Claim = {
      _id: claimId,
      title: 'Front-left side impact',
      description: 'Detailed claim description',
      status: 'In Review',
      totalAmount: 2290,
      createdAt: '2026-05-15T00:00:00.000Z',
      updatedAt: '2026-05-15T00:00:00.000Z'
    };
    httpClient.get.mockReturnValue(of(expectedClaim));

    const service = new ClaimApiService(httpClient as unknown as HttpClient);

    service.getClaimById(claimId).subscribe((claim) => {
      expect(httpClient.get).toHaveBeenCalledWith(
        `http://localhost:3000/api/claims/${claimId}`
      );
      expect(claim).toEqual(expectedClaim);
      done();
    });
  });

  it('sends claim updates to the claim patch endpoint', (done: DoneCallback) => {
    const httpClient = createHttpClientMock();
    const payload: UpdateClaimRequest = {
      status: 'Canceled',
      description: 'Updated description that explains why the claim was canceled.'
    };
    const updatedClaim: Claim = {
      _id: claimId,
      title: 'Front-left side impact',
      description: payload.description!,
      status: 'Canceled',
      totalAmount: 2290,
      createdAt: '2026-05-15T00:00:00.000Z',
      updatedAt: '2026-05-15T00:00:00.000Z'
    };
    httpClient.patch.mockReturnValue(of(updatedClaim));

    const service = new ClaimApiService(httpClient as unknown as HttpClient);

    service.updateClaim(claimId, payload).subscribe((claim) => {
      expect(httpClient.patch).toHaveBeenCalledWith(
        `http://localhost:3000/api/claims/${claimId}`,
        payload
      );
      expect(claim).toEqual(updatedClaim);
      done();
    });
  });
});
