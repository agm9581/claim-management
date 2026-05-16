import mongoose, { type HydratedDocument } from "mongoose";
import { DamageModel } from "../entities/models/damage/damage.model";
import type {
  CreateDamageInput,
  UpdateDamageInput,
} from "../entities/validators/damage/damage.validator";
import type { Damage, DamageSeverity } from "../entities/models/damage/damage.model";

export type DamageRecord = {
  _id: string;
  id: string;
  claimId: string;
  part: string;
  severity: DamageSeverity;
  imageUrl: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DamageDeleteResult = {
  acknowledged: boolean;
  deletedCount: number;
};

export type DamageRepository = {
  listByClaimId(claimId: string): Promise<DamageRecord[]>;
  findByIdAndClaimId(damageId: string, claimId: string): Promise<DamageRecord | null>;
  createForClaim(claimId: string, data: CreateDamageInput): Promise<DamageRecord>;
  updateByIdAndClaimId(
    damageId: string,
    claimId: string,
    data: UpdateDamageInput,
  ): Promise<DamageRecord | null>;
  deleteByIdAndClaimId(damageId: string, claimId: string): Promise<DamageRecord | null>;
  deleteByClaimId(claimId: string): Promise<DamageDeleteResult>;
  hasHighSeverityByClaimId(claimId: string): Promise<boolean>;
  sumPricesByClaimId(claimId: string): Promise<number>;
};

function toDamageRecord(damage: HydratedDocument<Damage> | null): DamageRecord | null {
  if (!damage) {
    return null;
  }

  return {
    _id: damage._id.toString(),
    id: damage.id,
    claimId: damage.claimId.toString(),
    part: damage.part,
    severity: damage.severity,
    imageUrl: damage.imageUrl,
    price: damage.price,
    createdAt: damage.createdAt,
    updatedAt: damage.updatedAt,
  };
}

export function createDamageRepository(): DamageRepository {
  return {
    async listByClaimId(claimId: string) {
      const damages = await DamageModel.find({ claimId }).sort({ createdAt: -1 }).exec();
      return damages.map((damage) => toDamageRecord(damage)!);
    },
    async findByIdAndClaimId(damageId: string, claimId: string) {
      return toDamageRecord(await DamageModel.findOne({ _id: damageId, claimId }).exec());
    },
    async createForClaim(claimId: string, data: CreateDamageInput) {
      return toDamageRecord(await DamageModel.create({
        ...data,
        claimId,
      }))!;
    },
    async updateByIdAndClaimId(damageId: string, claimId: string, data: UpdateDamageInput) {
      return toDamageRecord(await DamageModel.findOneAndUpdate(
        { _id: damageId, claimId },
        data,
        { new: true, runValidators: true },
      ).exec());
    },
    async deleteByIdAndClaimId(damageId: string, claimId: string) {
      return toDamageRecord(await DamageModel.findOneAndDelete({ _id: damageId, claimId }).exec());
    },
    async deleteByClaimId(claimId: string) {
      const result = await DamageModel.deleteMany({ claimId }).exec();
      return {
        acknowledged: result.acknowledged,
        deletedCount: result.deletedCount,
      };
    },
    async hasHighSeverityByClaimId(claimId: string) {
      return (await DamageModel.exists({ claimId, severity: "high" }).exec()) !== null;
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
