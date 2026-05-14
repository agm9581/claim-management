import type {
  CreateDamageInput,
  UpdateDamageInput,
} from "../entities/validators/damage/damage.validator";
import type { ClaimRepository } from "../repositories/claim.repository";
import type { DamageRepository } from "../repositories/damage.repository";
import { BusinessRuleError } from "../utils/business-rule-error";

export function createDamageService(
  claimRepository: ClaimRepository,
  damageRepository: DamageRepository,
) {
  async function syncClaimTotalAmount(claimId: string) {
    const totalAmount = await damageRepository.sumPricesByClaimId(claimId);
    await claimRepository.updateTotalAmount(claimId, totalAmount);
  }

  async function requirePendingClaim(claimId: string) {
    const claim = await claimRepository.findById(claimId);

    if (!claim) {
      return null;
    }

    if (claim.status !== "Pending") {
      throw new BusinessRuleError("Damages can only be managed while the claim is pending");
    }

    return claim;
  }

  return {
    getClaimById(claimId: string) {
      return claimRepository.findById(claimId);
    },
    listDamagesByClaimId(claimId: string) {
      return damageRepository.listByClaimId(claimId);
    },
    getDamageById(claimId: string, damageId: string) {
      return damageRepository.findByIdAndClaimId(damageId, claimId);
    },
    async createDamage(claimId: string, data: CreateDamageInput) {
      const claim = await requirePendingClaim(claimId);

      if (!claim) {
        return null;
      }

      const damage = await damageRepository.createForClaim(claimId, data);
      await syncClaimTotalAmount(claimId);
      return damage;
    },
    async updateDamage(claimId: string, damageId: string, data: UpdateDamageInput) {
      const claim = await requirePendingClaim(claimId);

      if (!claim) {
        return null;
      }

      const damage = await damageRepository.updateByIdAndClaimId(
        damageId,
        claimId,
        data,
      );

      if (!damage) {
        return null;
      }

      await syncClaimTotalAmount(claimId);
      return damage;
    },
    async deleteDamage(claimId: string, damageId: string) {
      const claim = await requirePendingClaim(claimId);

      if (!claim) {
        return null;
      }

      const damage = await damageRepository.deleteByIdAndClaimId(damageId, claimId);

      if (!damage) {
        return null;
      }

      await syncClaimTotalAmount(claimId);
      return damage;
    },
  };
}

export type DamageService = ReturnType<typeof createDamageService>;
