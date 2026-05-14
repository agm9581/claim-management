import { Request, Response, Router } from "express";
import {
  createDamageSchema,
  updateDamageSchema,
} from "../entities/validators/damage/damage.validator";
import { validateBody } from "../middleware/type-validator.middleware";
import type { DamageService } from "../services/damage.service";
import { isValidObjectId } from "../utils/object-id";

type DamageParams = { id: string; damageId: string };

export function createDamageRouter(damageService: DamageService) {
  const router = Router({ mergeParams: true });

  async function getClaimOrRespond(claimId: string, res: Response) {
    if (!isValidObjectId(claimId)) {
      res.status(400).json({ message: "Invalid claim ID" });
      return null;
    }

    const claim = await damageService.getClaimById(claimId);

    if (!claim) {
      res.status(404).json({ message: "Claim not found" });
      return null;
    }

    return claim;
  }

  router.get("/", async (req: Request<Pick<DamageParams, "id">>, res: Response) => {
    const claim = await getClaimOrRespond(req.params.id, res);

    if (!claim) {
      return;
    }

    const damages = await damageService.listDamagesByClaimId(claim.id);
    res.status(200).json(damages);
  });

  router.get("/:damageId", async (req: Request<DamageParams>, res: Response) => {
    const claim = await getClaimOrRespond(req.params.id, res);

    if (!claim) {
      return;
    }

    if (!isValidObjectId(req.params.damageId)) {
      return res.status(400).json({ message: "Invalid damage ID" });
    }

    const damage = await damageService.getDamageById(claim.id, req.params.damageId);

    if (!damage) {
      return res.status(404).json({ message: "Damage not found" });
    }

    res.status(200).json(damage);
  });

  router.post(
    "/",
    validateBody(createDamageSchema),
    async (req: Request<Pick<DamageParams, "id">>, res: Response) => {
      const claim = await getClaimOrRespond(req.params.id, res);

      if (!claim) {
        return;
      }

      const damage = await damageService.createDamage(claim.id, req.body);
      res.status(201).json(damage);
    },
  );

  router.patch(
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

      const damage = await damageService.updateDamage(
        claim.id,
        req.params.damageId,
        req.body,
      );

      if (!damage) {
        return res.status(404).json({ message: "Damage not found" });
      }

      res.status(200).json(damage);
    },
  );

  router.delete("/:damageId", async (req: Request<DamageParams>, res: Response) => {
    const claim = await getClaimOrRespond(req.params.id, res);

    if (!claim) {
      return;
    }

    if (!isValidObjectId(req.params.damageId)) {
      return res.status(400).json({ message: "Invalid damage ID" });
    }

    const damage = await damageService.deleteDamage(claim.id, req.params.damageId);

    if (!damage) {
      return res.status(404).json({ message: "Damage not found" });
    }

    res.status(204).send();
  });

  return router;
}
