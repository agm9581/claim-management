import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { CLAIM_STATUS } from "../entities/models/claim/claim.model";
import { DAMAGE_SEVERITY } from "../entities/models/damage/damage.model";
import type { CreateClaimInput } from "../entities/validators/claim/claim.validator";
import type {
  CreateDamageInput,
  UpdateDamageInput,
} from "../entities/validators/damage/damage.validator";
import { createClaimRepository } from "../repositories/claim.repository";
import { createDamageRepository } from "../repositories/damage.repository";
import { createClaimService } from "./claim.service";
import { createDamageService } from "./damage.service";

describe("damage total amount integration", () => {
  let mongoServer: MongoMemoryServer;

  const claimRepository = createClaimRepository();
  const damageRepository = createDamageRepository();
  const claimService = createClaimService(claimRepository, damageRepository);
  const damageService = createDamageService(claimRepository, damageRepository);

  const createClaimInput: CreateClaimInput = {
    title: "Front-left side impact",
    description: "Collision on the front-left corner affecting wheel arch and headlight.",
    status: CLAIM_STATUS.PENDING,
  };

  const firstDamageInput: CreateDamageInput = {
    part: "Front-left fender",
    severity: DAMAGE_SEVERITY.HIGH,
    imageUrl: "https://images.example.com/claims/front-left-fender.jpg",
    price: 1400,
  };

  const secondDamageInput: CreateDamageInput = {
    part: "Left headlight",
    severity: DAMAGE_SEVERITY.MID,
    imageUrl: "https://images.example.com/claims/left-headlight.jpg",
    price: 680,
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        ip: "127.0.0.1",
        port: 27027,
      },
    });
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer?.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db?.dropDatabase();
  });

  it("persists claim totalAmount as the sum of created damages", async () => {
    const claim = await claimService.createClaim(createClaimInput);

    await damageService.createDamage(claim.id, firstDamageInput);
    await damageService.createDamage(claim.id, secondDamageInput);

    const persistedClaim = await claimRepository.findById(claim.id);
    const persistedDamages = await damageRepository.listByClaimId(claim.id);
    const expectedTotal = persistedDamages.reduce((sum, damage) => sum + damage.price, 0);

    expect(persistedClaim?.totalAmount).toBe(expectedTotal);
    expect(expectedTotal).toBe(2080);
  });

  it("recalculates claim totalAmount after a damage update", async () => {
    const claim = await claimService.createClaim(createClaimInput);
    const createdDamage = await damageService.createDamage(claim.id, firstDamageInput);
    await damageService.createDamage(claim.id, secondDamageInput);

    const updateDamageInput: UpdateDamageInput = {
      price: 920,
    };

    await damageService.updateDamage(claim.id, createdDamage!._id, updateDamageInput);

    const persistedClaim = await claimRepository.findById(claim.id);
    const persistedDamages = await damageRepository.listByClaimId(claim.id);
    const expectedTotal = persistedDamages.reduce((sum, damage) => sum + damage.price, 0);

    expect(persistedClaim?.totalAmount).toBe(expectedTotal);
    expect(expectedTotal).toBe(1600);
  });

  it("recalculates claim totalAmount after a damage deletion", async () => {
    const claim = await claimService.createClaim(createClaimInput);
    const createdDamage = await damageService.createDamage(claim.id, firstDamageInput);
    await damageService.createDamage(claim.id, secondDamageInput);

    await damageService.deleteDamage(claim.id, createdDamage!._id);

    const persistedClaim = await claimRepository.findById(claim.id);
    const persistedDamages = await damageRepository.listByClaimId(claim.id);
    const expectedTotal = persistedDamages.reduce((sum, damage) => sum + damage.price, 0);

    expect(persistedClaim?.totalAmount).toBe(expectedTotal);
    expect(expectedTotal).toBe(680);
  });
});
