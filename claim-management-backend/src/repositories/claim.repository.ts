import type { HydratedDocument } from "mongoose";
import { ClaimModel } from "../entities/models/claim/claim.model";
import type {
  CreateClaimInput,
  UpdateClaimInput,
} from "../entities/validators/claim/claim.validator";
import type { Claim, ClaimStatus } from "../entities/models/claim/claim.model";

export type ClaimRecord = {
  _id: string;
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ClaimRepository = {
  list(): Promise<ClaimRecord[]>;
  findById(id: string): Promise<ClaimRecord | null>;
  create(data: CreateClaimInput): Promise<ClaimRecord>;
  updateById(id: string, data: UpdateClaimInput): Promise<ClaimRecord | null>;
  deleteById(id: string): Promise<ClaimRecord | null>;
  updateTotalAmount(id: string, totalAmount: number): Promise<ClaimRecord | null>;
};

function toClaimRecord(claim: HydratedDocument<Claim> | null): ClaimRecord | null {
  if (!claim) {
    return null;
  }

  return {
    _id: claim._id.toString(),
    id: claim.id,
    title: claim.title,
    description: claim.description,
    status: claim.status,
    totalAmount: claim.totalAmount,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
  };
}

export function createClaimRepository(): ClaimRepository {
  return {
    async list() {
      const claims = await ClaimModel.find().sort({ createdAt: -1 }).exec();
      return claims.map((claim) => toClaimRecord(claim)!);
    },
    async findById(id: string) {
      return toClaimRecord(await ClaimModel.findById(id).exec());
    },
    async create(data: CreateClaimInput) {
      return toClaimRecord(await ClaimModel.create(data))!;
    },
    async updateById(id: string, data: UpdateClaimInput) {
      return toClaimRecord(await ClaimModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).exec());
    },
    async deleteById(id: string) {
      return toClaimRecord(await ClaimModel.findByIdAndDelete(id).exec());
    },
    async updateTotalAmount(id: string, totalAmount: number) {
      return toClaimRecord(await ClaimModel.findByIdAndUpdate(id, { totalAmount }, { new: true }).exec());
    },
  };
}
