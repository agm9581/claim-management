import { createClaimRepository } from "./repositories/claim.repository";
import { createDamageRepository } from "./repositories/damage.repository";
import { createClaimService } from "./services/claim.service";
import { createDamageService } from "./services/damage.service";

export function createDependencies() {
  const claimRepository = createClaimRepository();
  const damageRepository = createDamageRepository();
  const claimService = createClaimService(claimRepository, damageRepository);
  const damageService = createDamageService(claimRepository, damageRepository);

  return {
    claimService,
    damageService,
  };
}

export type AppDependencies = ReturnType<typeof createDependencies>;
