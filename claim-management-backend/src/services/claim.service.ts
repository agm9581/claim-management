import type {
  CreateClaimInput,
  UpdateClaimInput,
} from "../entities/validators/claim/claim.validator";
import type { ClaimRepository } from "../repositories/claim.repository";
import type { DamageRepository } from "../repositories/damage.repository";

export function createClaimService(
  claimRepository: ClaimRepository,
  damageRepository: DamageRepository,
) {
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
    updateClaim(id: string, data: UpdateClaimInput) {
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
