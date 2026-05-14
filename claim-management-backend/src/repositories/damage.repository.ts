import mongoose from "mongoose";
import { DamageModel } from "../entities/models/damage/damage.model";
import type {
  CreateDamageInput,
  UpdateDamageInput,
} from "../entities/validators/damage/damage.validator";

export function createDamageRepository() {
  return {
    listByClaimId(claimId: string) {
      return DamageModel.find({ claimId }).sort({ createdAt: -1 });
    },
    findByIdAndClaimId(damageId: string, claimId: string) {
      return DamageModel.findOne({ _id: damageId, claimId });
    },
    createForClaim(claimId: string, data: CreateDamageInput) {
      return DamageModel.create({
        ...data,
        claimId,
      });
    },
    updateByIdAndClaimId(damageId: string, claimId: string, data: UpdateDamageInput) {
      return DamageModel.findOneAndUpdate(
        { _id: damageId, claimId },
        data,
        { new: true, runValidators: true },
      );
    },
    deleteByIdAndClaimId(damageId: string, claimId: string) {
      return DamageModel.findOneAndDelete({ _id: damageId, claimId });
    },
    deleteByClaimId(claimId: string) {
      return DamageModel.deleteMany({ claimId });
    },
    async sumPricesByClaimId(claimId: string) {
      const [result] = await DamageModel.aggregate<{ totalAmount: number }>([
        { $match: { claimId: new mongoose.Types.ObjectId(claimId) } },
        { $group: { _id: null, totalAmount: { $sum: "$price" } } },
      ]);

      return result?.totalAmount ?? 0;
    },
  };
}

export type DamageRepository = ReturnType<typeof createDamageRepository>;
