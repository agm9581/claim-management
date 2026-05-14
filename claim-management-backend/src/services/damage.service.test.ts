import { describe, expect, it, jest } from "@jest/globals";
import { createDamageService } from "./damage.service";
import type { ClaimRepository } from "../repositories/claim.repository";
import type { DamageRepository } from "../repositories/damage.repository";
import type {
  CreateDamageInput,
  UpdateDamageInput,
} from "../entities/validators/damage/damage.validator";
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

describe("createDamageService", () => {
  const claimId = "6824d4d8c6f0c3a59748df11";
  const damageId = "6824d4d8c6f0c3a59748df21";
  const createDamageInput: CreateDamageInput = {
    part: "Rear bumper",
    severity: "mid",
    imageUrl: "https://images.example.com/claims/rear-bumper.jpg",
    price: 850,
    score: 6,
  };
  const updateDamageInput: UpdateDamageInput = {
    price: 920,
    score: 7,
  };

  it("gets a claim by id through the repository", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    const expectedClaim = { _id: claimId };
    claimRepository.findById.mockResolvedValue(expectedClaim as never);

    const service = createDamageService(claimRepository, damageRepository);
    const claim = await service.getClaimById(claimId);

    expect(claimRepository.findById).toHaveBeenCalledWith(claimId);
    expect(claim).toBe(expectedClaim);
  });

  it("lists damages by claim id through the repository", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    const expectedDamages = [{ _id: damageId }];
    damageRepository.listByClaimId.mockResolvedValue(expectedDamages as never[]);

    const service = createDamageService(claimRepository, damageRepository);
    const damages = await service.listDamagesByClaimId(claimId);

    expect(damageRepository.listByClaimId).toHaveBeenCalledWith(claimId);
    expect(damages).toBe(expectedDamages);
  });

  it("gets a damage by claim id and damage id through the repository", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    const expectedDamage = { _id: damageId, claimId };
    damageRepository.findByIdAndClaimId.mockResolvedValue(expectedDamage as never);

    const service = createDamageService(claimRepository, damageRepository);
    const damage = await service.getDamageById(claimId, damageId);

    expect(damageRepository.findByIdAndClaimId).toHaveBeenCalledWith(damageId, claimId);
    expect(damage).toBe(expectedDamage);
  });

  it("creates a damage and syncs the claim total amount", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue({ _id: claimId, status: "Pending" } as never);
    const createdDamage = { _id: damageId, claimId, ...createDamageInput };
    damageRepository.createForClaim.mockResolvedValue(createdDamage as never);
    damageRepository.sumPricesByClaimId.mockResolvedValue(1270);
    claimRepository.updateTotalAmount.mockResolvedValue({ _id: claimId, totalAmount: 1270 } as never);

    const service = createDamageService(claimRepository, damageRepository);
    const damage = await service.createDamage(claimId, createDamageInput);

    expect(damageRepository.createForClaim).toHaveBeenCalledWith(claimId, createDamageInput);
    expect(damageRepository.sumPricesByClaimId).toHaveBeenCalledWith(claimId);
    expect(claimRepository.updateTotalAmount).toHaveBeenCalledWith(claimId, 1270);
    expect(damage).toBe(createdDamage);
  });

  it("updates a damage and syncs the claim total amount when the damage exists", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue({ _id: claimId, status: "Pending" } as never);
    const updatedDamage = { _id: damageId, claimId, ...updateDamageInput };
    damageRepository.updateByIdAndClaimId.mockResolvedValue(updatedDamage as never);
    damageRepository.sumPricesByClaimId.mockResolvedValue(1340);
    claimRepository.updateTotalAmount.mockResolvedValue({ _id: claimId, totalAmount: 1340 } as never);

    const service = createDamageService(claimRepository, damageRepository);
    const damage = await service.updateDamage(claimId, damageId, updateDamageInput);

    expect(damageRepository.updateByIdAndClaimId).toHaveBeenCalledWith(
      damageId,
      claimId,
      updateDamageInput,
    );
    expect(damageRepository.sumPricesByClaimId).toHaveBeenCalledWith(claimId);
    expect(claimRepository.updateTotalAmount).toHaveBeenCalledWith(claimId, 1340);
    expect(damage).toBe(updatedDamage);
  });

  it("does not sync the claim total amount when an update misses the damage", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue({ _id: claimId, status: "Pending" } as never);
    damageRepository.updateByIdAndClaimId.mockResolvedValue(null);

    const service = createDamageService(claimRepository, damageRepository);
    const damage = await service.updateDamage(claimId, damageId, updateDamageInput);

    expect(damageRepository.updateByIdAndClaimId).toHaveBeenCalledWith(
      damageId,
      claimId,
      updateDamageInput,
    );
    expect(damageRepository.sumPricesByClaimId).not.toHaveBeenCalled();
    expect(claimRepository.updateTotalAmount).not.toHaveBeenCalled();
    expect(damage).toBeNull();
  });

  it("deletes a damage and syncs the claim total amount when the damage exists", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue({ _id: claimId, status: "Pending" } as never);
    const deletedDamage = { _id: damageId, claimId };
    damageRepository.deleteByIdAndClaimId.mockResolvedValue(deletedDamage as never);
    damageRepository.sumPricesByClaimId.mockResolvedValue(420);
    claimRepository.updateTotalAmount.mockResolvedValue({ _id: claimId, totalAmount: 420 } as never);

    const service = createDamageService(claimRepository, damageRepository);
    const damage = await service.deleteDamage(claimId, damageId);

    expect(damageRepository.deleteByIdAndClaimId).toHaveBeenCalledWith(damageId, claimId);
    expect(damageRepository.sumPricesByClaimId).toHaveBeenCalledWith(claimId);
    expect(claimRepository.updateTotalAmount).toHaveBeenCalledWith(claimId, 420);
    expect(damage).toBe(deletedDamage);
  });

  it("does not sync the claim total amount when a delete misses the damage", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue({ _id: claimId, status: "Pending" } as never);
    damageRepository.deleteByIdAndClaimId.mockResolvedValue(null);

    const service = createDamageService(claimRepository, damageRepository);
    const damage = await service.deleteDamage(claimId, damageId);

    expect(damageRepository.deleteByIdAndClaimId).toHaveBeenCalledWith(damageId, claimId);
    expect(damageRepository.sumPricesByClaimId).not.toHaveBeenCalled();
    expect(claimRepository.updateTotalAmount).not.toHaveBeenCalled();
    expect(damage).toBeNull();
  });

  it("returns null when creating a damage for a missing claim", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue(null);

    const service = createDamageService(claimRepository, damageRepository);
    const damage = await service.createDamage(claimId, createDamageInput);

    expect(damageRepository.createForClaim).not.toHaveBeenCalled();
    expect(damage).toBeNull();
  });

  it("rejects damage creation when the claim is not pending", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue({ _id: claimId, status: "Finished" } as never);

    const service = createDamageService(claimRepository, damageRepository);

    await expect(service.createDamage(claimId, createDamageInput)).rejects.toThrow(
      new BusinessRuleError("Damages can only be managed while the claim is pending"),
    );
    expect(damageRepository.createForClaim).not.toHaveBeenCalled();
  });

  it("rejects damage updates when the claim is not pending", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue({ _id: claimId, status: "In Review" } as never);

    const service = createDamageService(claimRepository, damageRepository);

    await expect(service.updateDamage(claimId, damageId, updateDamageInput)).rejects.toThrow(
      new BusinessRuleError("Damages can only be managed while the claim is pending"),
    );
    expect(damageRepository.updateByIdAndClaimId).not.toHaveBeenCalled();
  });

  it("rejects damage deletion when the claim is not pending", async () => {
    const claimRepository = createClaimRepositoryMock();
    const damageRepository = createDamageRepositoryMock();
    claimRepository.findById.mockResolvedValue({ _id: claimId, status: "Canceled" } as never);

    const service = createDamageService(claimRepository, damageRepository);

    await expect(service.deleteDamage(claimId, damageId)).rejects.toThrow(
      new BusinessRuleError("Damages can only be managed while the claim is pending"),
    );
    expect(damageRepository.deleteByIdAndClaimId).not.toHaveBeenCalled();
  });
});
