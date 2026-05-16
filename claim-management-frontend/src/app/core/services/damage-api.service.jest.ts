import { describe, expect, it, jest } from '@jest/globals';
import { of } from 'rxjs';
import type { HttpClient } from '@angular/common/http';
import { DamageApiService } from './damage-api.service';
import {
  DAMAGE_SEVERITY,
  type CreateDamageRequest,
  type Damage,
  type UpdateDamageRequest,
} from '../../types/damage.types';

function createHttpClientMock() {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'>>;
}

describe('DamageApiService', () => {
  const claimId = '6824d4d8c6f0c3a59748df11';
  const damageId = '6824d4d8c6f0c3a59748df21';

  it('requests damages for a claim from the nested damages endpoint', (done) => {
    const httpClient = createHttpClientMock();
    const expectedDamages: Damage[] = [
      {
        _id: damageId,
        claimId,
        part: 'Rear bumper',
        severity: DAMAGE_SEVERITY.MID,
        imageUrl: 'https://images.example.com/claims/rear-bumper.jpg',
        price: 850,
        createdAt: '2026-05-15T00:00:00.000Z',
        updatedAt: '2026-05-15T00:00:00.000Z',
      },
    ];
    httpClient.get.mockReturnValue(of(expectedDamages));

    const service = new DamageApiService(httpClient as unknown as HttpClient);

    service.listDamagesByClaimId(claimId).subscribe((damages) => {
      expect(httpClient.get).toHaveBeenCalledWith(
        `http://localhost:3000/api/claims/${claimId}/damages`,
      );
      expect(damages).toEqual(expectedDamages);
      done();
    });
  });

  it('posts a new damage to the nested damages endpoint', (done) => {
    const httpClient = createHttpClientMock();
    const payload: CreateDamageRequest = {
      part: 'Rear bumper',
      severity: DAMAGE_SEVERITY.MID,
      imageUrl: 'https://images.example.com/claims/rear-bumper.jpg',
      price: 850,
    };
    const createdDamage: Damage = {
      _id: damageId,
      claimId,
      ...payload,
      createdAt: '2026-05-15T00:00:00.000Z',
      updatedAt: '2026-05-15T00:00:00.000Z',
    };
    httpClient.post.mockReturnValue(of(createdDamage));

    const service = new DamageApiService(httpClient as unknown as HttpClient);

    service.createDamage(claimId, payload).subscribe((damage) => {
      expect(httpClient.post).toHaveBeenCalledWith(
        `http://localhost:3000/api/claims/${claimId}/damages`,
        payload,
      );
      expect(damage).toEqual(createdDamage);
      done();
    });
  });

  it('patches an existing damage through the nested damage endpoint', (done) => {
    const httpClient = createHttpClientMock();
    const payload: UpdateDamageRequest = {
      price: 920,
    };
    const updatedDamage: Damage = {
      _id: damageId,
      claimId,
      part: 'Rear bumper',
      severity: DAMAGE_SEVERITY.MID,
      imageUrl: 'https://images.example.com/claims/rear-bumper.jpg',
      price: 920,
      createdAt: '2026-05-15T00:00:00.000Z',
      updatedAt: '2026-05-15T00:00:00.000Z',
    };
    httpClient.patch.mockReturnValue(of(updatedDamage));

    const service = new DamageApiService(httpClient as unknown as HttpClient);

    service.updateDamage(claimId, damageId, payload).subscribe((damage) => {
      expect(httpClient.patch).toHaveBeenCalledWith(
        `http://localhost:3000/api/claims/${claimId}/damages/${damageId}`,
        payload,
      );
      expect(damage).toEqual(updatedDamage);
      done();
    });
  });

  it('deletes a damage through the nested damage endpoint', (done) => {
    const httpClient = createHttpClientMock();
    httpClient.delete.mockReturnValue(of(void 0));

    const service = new DamageApiService(httpClient as unknown as HttpClient);

    service.deleteDamage(claimId, damageId).subscribe((response) => {
      expect(httpClient.delete).toHaveBeenCalledWith(
        `http://localhost:3000/api/claims/${claimId}/damages/${damageId}`,
      );
      expect(response).toBeUndefined();
      done();
    });
  });
});
