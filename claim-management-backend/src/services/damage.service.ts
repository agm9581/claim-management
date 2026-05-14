import type {
  CreateDamageInput,
  UpdateDamageInput,
} from "../entities/validators/damage/damage.validator";
import type { ClaimRepository } from "../repositories/claim.repository";
import type { DamageRepository } from "../repositories/damage.repository";

export function createDamageService(
  claimRepository: ClaimRepository,
  damageRepository: DamageRepository,
) {
  async function syncClaimTotalAmount(claimId: string) {
    const totalAmount = await damageRepository.sumPricesByClaimId(claimId);
    await claimRepository.updateTotalAmount(claimId, totalAmount);
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
      const damage = await damageRepository.createForClaim(claimId, data);
      await syncClaimTotalAmount(claimId);
      return damage;
    },
    async updateDamage(claimId: string, damageId: string, data: UpdateDamageInput) {
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
