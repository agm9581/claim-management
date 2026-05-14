import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import { ClaimModel } from "../entities/models/claim/claim.model";
import { DamageModel } from "../entities/models/damage/damage.model";
import {
  createDamageSchema,
  updateDamageSchema,
} from "../entities/validators/damage/damage.validator";
import { validateBody } from "../middleware/type-validator.middleware";

const DamageRouter = Router({ mergeParams: true });
type DamageParams = { id: string; damageId: string };

function isValidObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value);
}

async function getClaimOrRespond(claimId: string, res: Response) {
  if (!isValidObjectId(claimId)) {
    res.status(400).json({ message: "Invalid claim ID" });
    return null;
  }

  const claim = await ClaimModel.findById(claimId);

  if (!claim) {
    res.status(404).json({ message: "Claim not found" });
    return null;
  }

  return claim;
}

async function syncClaimTotalAmount(claimId: string) {
  const [result] = await DamageModel.aggregate<{ totalAmount: number }>([
    { $match: { claimId: new mongoose.Types.ObjectId(claimId) } },
    { $group: { _id: null, totalAmount: { $sum: "$price" } } },
  ]);

  await ClaimModel.findByIdAndUpdate(claimId, {
    totalAmount: result?.totalAmount ?? 0,
  });
}

DamageRouter.get("/", async (req: Request<Pick<DamageParams, "id">>, res: Response) => {
  const claim = await getClaimOrRespond(req.params.id, res);

  if (!claim) {
    return;
  }

  const damages = await DamageModel.find({ claimId: claim.id }).sort({
    createdAt: -1,
  });

  res.status(200).json(damages);
});

DamageRouter.get("/:damageId", async (req: Request<DamageParams>, res: Response) => {
  const claim = await getClaimOrRespond(req.params.id, res);

  if (!claim) {
    return;
  }

  if (!isValidObjectId(req.params.damageId)) {
    return res.status(400).json({ message: "Invalid damage ID" });
  }

  const damage = await DamageModel.findOne({
    _id: req.params.damageId,
    claimId: claim.id,
  });

  if (!damage) {
    return res.status(404).json({ message: "Damage not found" });
  }

  res.status(200).json(damage);
});

DamageRouter.post(
  "/",
  validateBody(createDamageSchema),
  async (req: Request<Pick<DamageParams, "id">>, res: Response) => {
    const claim = await getClaimOrRespond(req.params.id, res);

    if (!claim) {
      return;
    }

    const damage = await DamageModel.create({
      ...req.body,
      claimId: claim.id,
    });

    await syncClaimTotalAmount(claim.id);

    res.status(201).json(damage);
  },
);

DamageRouter.patch(
  "/:damageId",
  validateBody(updateDamageSchema),
  async (req: Request<DamageParams>, res: Response) => {
    const claim = await getClaimOrRespond(req.params.id, res);

    if (!claim) {
      return;
    }

    if (!isValidObjectId(req.params.damageId)) {
      return res.status(400).json({ message: "Invalid damage ID" });
    }

    const damage = await DamageModel.findOneAndUpdate(
      {
        _id: req.params.damageId,
        claimId: claim.id,
      },
      req.body,
      { new: true, runValidators: true },
    );

    if (!damage) {
      return res.status(404).json({ message: "Damage not found" });
    }

    await syncClaimTotalAmount(claim.id);

    res.status(200).json(damage);
  },
);

DamageRouter.delete("/:damageId", async (req: Request<DamageParams>, res: Response) => {
  const claim = await getClaimOrRespond(req.params.id, res);

  if (!claim) {
    return;
  }

  if (!isValidObjectId(req.params.damageId)) {
    return res.status(400).json({ message: "Invalid damage ID" });
  }

  const damage = await DamageModel.findOneAndDelete({
    _id: req.params.damageId,
    claimId: claim.id,
  });

  if (!damage) {
    return res.status(404).json({ message: "Damage not found" });
  }

  await syncClaimTotalAmount(claim.id);

  res.status(204).send();
});

export default DamageRouter;
