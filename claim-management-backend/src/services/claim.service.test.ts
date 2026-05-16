import { describe, expect, it, jest } from "@jest/globals";
import { createClaimService } from "./claim.service";
import { CLAIM_STATUS } from "../entities/models/claim/claim.model";
import type { ClaimRecord, ClaimRepository } from "../repositories/claim.repository";
import type { DamageRepository } from "../repositories/damage.repository";
import type {
  CreateClaimInput,
  UpdateClaimInput,
} from "../entities/validators/claim/claim.validator";
import { BusinessRuleError } from "../utils/business-rule-error";

function createClaimRepositoryMock(): jest.Mocked<ClaimRepository> {
  return {
    list: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    updateTotalAmount: jest.fn(),
  };
}

function createDamageRepositoryMock(): jest.Mocked<DamageRepository> {
  return {
    listByClaimId: jest.fn(),
    findByIdAndClaimId: jest.fn(),
    createForClaim: jest.fn(),
    updateByIdAndClaimId: jest.fn(),
    deleteByIdAndClaimId: jest.fn(),
    deleteByClaimId: jest.fn(),
    hasHighSeverityByClaimId: jest.fn(),
    sumPricesByClaimId: jest.fn(),
  };
}

function buildClaim(overrides: Partial<ClaimRecord> = {}): ClaimRecord {
  return {
    _id: "6824d4d8c6f0c3a59748df11",
    id: "6824d4d8c6f0c3a59748df11",
    title: "Existing claim",
    description:
      "This description is intentionally longer than one hundred characters to allow the claim to move into a finished state safely.",
    status: CLAIM_STATUS.IN_REVIEW,
    totalAmount: 0,
    createdAt: new Date("2026-05-16T10:00:00.000Z"),
    updatedAt: new Date("2026-05-16T10:00:00.000Z"),
    ...overrides,
  };
}

describe("createClaimService", () => {
  const claimId = "6824d4d8c6f0c3a59748df11";
  const createClaimInput: CreateClaimInput = {
    title: "Rear bumper collision",
    description: "Low speed parking impact with visible rear bumper damage.",
    status: CLAIM_STATUS.IN_REVIEW,
  };
  const updateClaimInput: UpdateClaimInput = {
    status: CLAIM_STATUS.FINISHED,
  };

  it("lists claims through the repository", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    const expectedClaims = [buildClaim()];
    claimRepository.list.mockResolvedValue(expectedClaims);

    const service = createClaimService(claimRepository, damageRepository);
    const claims = await service.listClaims();

    expect(claimRepository.list).toHaveBeenCalledTimes(1);
    expect(claims).toBe(expectedClaims);
  });

  it("gets a claim by id through the repository", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    const expectedClaim = buildClaim();
    claimRepository.findById.mockResolvedValue(expectedClaim);

    const service = createClaimService(claimRepository, damageRepository);
    const claim = await service.getClaimById(claimId);

    expect(claimRepository.findById).toHaveBeenCalledWith(claimId);
    expect(claim).toBe(expectedClaim);
  });

  it("creates a claim through the repository", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    const createdClaim = buildClaim({
      _id: claimId,
      id: claimId,
      title: createClaimInput.title,
      description: createClaimInput.description,
      status: createClaimInput.status ?? CLAIM_STATUS.PENDING,
    });
    claimRepository.create.mockResolvedValue(createdClaim);

    const service = createClaimService(claimRepository, damageRepository);
    const claim = await service.createClaim(createClaimInput);

    expect(claimRepository.create).toHaveBeenCalledWith(createClaimInput);
    expect(claim).toBe(createdClaim);
  });

  it("updates a claim through the repository", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue(buildClaim());
    damageRepository.hasHighSeverityByClaimId.mockResolvedValue(true);
    const updatedClaim = buildClaim({ status: CLAIM_STATUS.FINISHED });
    claimRepository.updateById.mockResolvedValue(updatedClaim);

    const service = createClaimService(claimRepository, damageRepository);
    const claim = await service.updateClaim(claimId, updateClaimInput);

    expect(claimRepository.updateById).toHaveBeenCalledWith(claimId, updateClaimInput);
    expect(claim).toBe(updatedClaim);
  });

  it("returns null when the claim to update does not exist", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue(null);

    const service = createClaimService(claimRepository, damageRepository);
    const claim = await service.updateClaim(claimId, updateClaimInput);

    expect(claimRepository.findById).toHaveBeenCalledWith(claimId);
    expect(claimRepository.updateById).not.toHaveBeenCalled();
    expect(claim).toBeNull();
  });

  it("rejects finishing a claim without a high severity damage", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue(buildClaim());
    damageRepository.hasHighSeverityByClaimId.mockResolvedValue(false);

    const service = createClaimService(claimRepository, damageRepository);

    await expect(service.updateClaim(claimId, { status: CLAIM_STATUS.FINISHED })).rejects.toThrow(
      new BusinessRuleError(
        "A claim needs at least one high severity damage before it can be finished",
      ),
    );
    expect(claimRepository.updateById).not.toHaveBeenCalled();
  });

  it("rejects finishing a claim with a short description", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue(buildClaim({ description: "Too short" }));
    damageRepository.hasHighSeverityByClaimId.mockResolvedValue(true);

    const service = createClaimService(claimRepository, damageRepository);

    await expect(service.updateClaim(claimId, { status: CLAIM_STATUS.FINISHED })).rejects.toThrow(
      new BusinessRuleError(
        "A finished claim with high severity damage requires a description longer than 100 characters",
      ),
    );
    expect(claimRepository.updateById).not.toHaveBeenCalled();
  });

  it("deletes a claim and cascades damages when the claim exists", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    const deletedClaim = buildClaim();
    claimRepository.deleteById.mockResolvedValue(deletedClaim);
    damageRepository.deleteByClaimId.mockResolvedValue({ acknowledged: true, deletedCount: 2 });

    const service = createClaimService(claimRepository, damageRepository);
    const claim = await service.deleteClaim(claimId);

    expect(claimRepository.deleteById).toHaveBeenCalledWith(claimId);
    expect(damageRepository.deleteByClaimId).toHaveBeenCalledWith(claimId);
    expect(claim).toBe(deletedClaim);
  });

  it("does not cascade damages when the claim does not exist", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.deleteById.mockResolvedValue(null);

    const service = createClaimService(claimRepository, damageRepository);
    const claim = await service.deleteClaim(claimId);

    expect(claimRepository.deleteById).toHaveBeenCalledWith(claimId);
    expect(damageRepository.deleteByClaimId).not.toHaveBeenCalled();
    expect(claim).toBeNull();
  });
});
