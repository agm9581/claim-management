import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { ClaimModel } from "../entities/models/claim/claim.model";
import { DamageModel } from "../entities/models/damage/damage.model";
import {
  createClaimSchema,
  updateClaimSchema,
} from "../entities/validators/claim/claim.validator";
import { validateBody } from "../middleware/type-validator.middleware";

const ClaimRouter = Router();
type ClaimParams = { id: string };

function isValidObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value);
}

ClaimRouter.get("/", async (_req: Request, res: Response) => {
  const claims = await ClaimModel.find().sort({ createdAt: -1 });
  res.status(200).json(claims);
});

ClaimRouter.get("/:id", async (req: Request<ClaimParams>, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid claim ID" });
  }

  const claim = await ClaimModel.findById(req.params.id);

  if (!claim) {
    return res.status(404).json({ message: "Claim not found" });
  }

  res.status(200).json(claim);
});

ClaimRouter.post(
  "/",
  validateBody(createClaimSchema),
  async (req: Request, res: Response) => {
    const claim = await ClaimModel.create(req.body);
    res.status(201).json(claim);
  },
);

ClaimRouter.patch(
  "/:id",
  validateBody(updateClaimSchema),
  async (req: Request<ClaimParams>, res: Response) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid claim ID" });
    }

    const claim = await ClaimModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.status(200).json(claim);
  },
);

ClaimRouter.delete("/:id", async (req: Request<ClaimParams>, res: Response) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid claim ID" });
  }

  const claim = await ClaimModel.findByIdAndDelete(req.params.id);

  if (!claim) {
    return res.status(404).json({ message: "Claim not found" });
  }

  await DamageModel.deleteMany({ claimId: req.params.id });

  res.status(204).send();
});

export default ClaimRouter;
