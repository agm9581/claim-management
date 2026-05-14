import type {
  CreateClaimInput,
  UpdateClaimInput,
} from "../entities/validators/claim/claim.validator";
import type { ClaimStatus } from "../entities/models/claim/claim.model";
import type { ClaimRepository } from "../repositories/claim.repository";
import type { DamageRepository } from "../repositories/damage.repository";
import { BusinessRuleError } from "../utils/business-rule-error";

export function createClaimService(
  claimRepository: ClaimRepository,
  damageRepository: DamageRepository,
) {
  async function validateStatusTransition(
    claimId: string,
    currentStatus: ClaimStatus,
    nextStatus: ClaimStatus,
    nextDescription: string,
  ) {
    if (nextStatus === "Canceled" && currentStatus !== "Pending") {
      throw new BusinessRuleError("Only pending claims can be canceled");
    }

    if (nextStatus === "Finished") {
      const hasHighSeverityDamage = await damageRepository.hasHighSeverityByClaimId(claimId);

      if (!hasHighSeverityDamage) {
        throw new BusinessRuleError(
          "A claim needs at least one high severity damage before it can be finished",
        );
      }

      if (nextDescription.trim().length <= 100) {
        throw new BusinessRuleError(
          "A finished claim with high severity damage requires a description longer than 100 characters",
        );
      }
    }
  }

  return {
    listClaims() {
      return claimRepository.list();
    },
    getClaimById(id: string) {
      return claimRepository.findById(id);
    },
    createClaim(data: CreateClaimInput) {
      return claimRepository.create(data);
    },
    async updateClaim(id: string, data: UpdateClaimInput) {
      const existingClaim = await claimRepository.findById(id);

      if (!existingClaim) {
        return null;
      }

      const nextStatus = data.status ?? existingClaim.status;
      const nextDescription = data.description ?? existingClaim.description;

      await validateStatusTransition(id, existingClaim.status, nextStatus, nextDescription);

      return claimRepository.updateById(id, data);
    },
    async deleteClaim(id: string) {
      const claim = await claimRepository.deleteById(id);

      if (!claim) {
        return null;
      }

      await damageRepository.deleteByClaimId(id);
      return claim;
    },
  };
}

export type ClaimService = ReturnType<typeof createClaimService>;
