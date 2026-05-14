import { ClaimModel } from "../entities/models/claim/claim.model";
import type {
  CreateClaimInput,
  UpdateClaimInput,
} from "../entities/validators/claim/claim.validator";

export function createClaimRepository() {
  return {
    list() {
      return ClaimModel.find().sort({ createdAt: -1 });
    },
    findById(id: string) {
      return ClaimModel.findById(id);
    },
    create(data: CreateClaimInput) {
      return ClaimModel.create(data);
    },
    updateById(id: string, data: UpdateClaimInput) {
      return ClaimModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
    },
    deleteById(id: string) {
      return ClaimModel.findByIdAndDelete(id);
    },
    updateTotalAmount(id: string, totalAmount: number) {
      return ClaimModel.findByIdAndUpdate(id, { totalAmount });
    },
  };
}

export type ClaimRepository = ReturnType<typeof createClaimRepository>;
