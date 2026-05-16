export const DAMAGE_SEVERITY = {
  LOW: 'low',
  MID: 'mid',
  HIGH: 'high'
} as const;

export const DAMAGE_SEVERITY_VALUES = Object.values(DAMAGE_SEVERITY);

export type DamageSeverity = (typeof DAMAGE_SEVERITY)[keyof typeof DAMAGE_SEVERITY];

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
