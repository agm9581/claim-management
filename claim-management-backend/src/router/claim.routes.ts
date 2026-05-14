import { Router, Request, Response } from "express";
import {
  createClaimSchema,
  updateClaimSchema,
} from "../entities/validators/claim/claim.validator";
import { validateBody } from "../middleware/type-validator.middleware";
import type { ClaimService } from "../services/claim.service";
import { isValidObjectId } from "../utils/object-id";

type ClaimParams = { id: string };

export function createClaimRouter(claimService: ClaimService) {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    const claims = await claimService.listClaims();
    res.status(200).json(claims);
  });

  router.get("/:id", async (req: Request<ClaimParams>, res: Response) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid claim ID" });
    }

    const claim = await claimService.getClaimById(req.params.id);

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.status(200).json(claim);
  });

  router.post(
    "/",
    validateBody(createClaimSchema),
    async (req: Request, res: Response) => {
      const claim = await claimService.createClaim(req.body);
      res.status(201).json(claim);
    },
  );

  router.patch(
    "/:id",
    validateBody(updateClaimSchema),
    async (req: Request<ClaimParams>, res: Response) => {
      if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid claim ID" });
      }

      const claim = await claimService.updateClaim(req.params.id, req.body);

      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      res.status(200).json(claim);
    },
  );

  router.delete("/:id", async (req: Request<ClaimParams>, res: Response) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid claim ID" });
    }

    const claim = await claimService.deleteClaim(req.params.id);

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.status(204).send();
  });

  return router;
}
