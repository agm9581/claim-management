export type DamageSeverity = 'low' | 'mid' | 'high';

export interface Damage {
  _id: string;
  claimId: string;
  part: string;
  severity: DamageSeverity;
  imageUrl: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDamageRequest {
  part: string;
  severity: DamageSeverity;
  imageUrl: string;
  price: number;
}

export type UpdateDamageRequest = Partial<CreateDamageRequest>;
