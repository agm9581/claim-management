export const CLAIM_STATUS = {
  PENDING: 'Pending',
  IN_REVIEW: 'In Review',
  FINISHED: 'Finished'
} as const;

export const CLAIM_STATUS_VALUES = Object.values(CLAIM_STATUS);

export type ClaimStatus = (typeof CLAIM_STATUS)[keyof typeof CLAIM_STATUS];

export interface Claim {
  _id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClaimRequest {
  title?: string;
  description?: string;
  status?: ClaimStatus;
}
