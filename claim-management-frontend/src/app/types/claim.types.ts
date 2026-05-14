export type ClaimStatus = 'Pending' | 'In Review' | 'Finished' | 'Canceled';

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
