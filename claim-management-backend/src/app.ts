import express, { Router } from "express";
import ClaimRouter from "./router/claim.routes";
import DamageRouter from "./router/damage.routes";

export function createApp() {
  const app = express();
  const router = Router();

  app.use(express.json());

  app.use("/api", router);
  router.use("/claims", ClaimRouter);
  router.use("/claims/:id/damages", DamageRouter);

  return app;
}
