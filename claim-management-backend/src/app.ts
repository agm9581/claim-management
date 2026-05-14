import express, { Router } from "express";
import swaggerUi from "swagger-ui-express";
import path from "node:path";
import fs from "node:fs";
import YAML from "yaml";
import type { AppDependencies } from "./dependencies";
import { createClaimRouter } from "./router/claim.routes";
import { createDamageRouter } from "./router/damage.routes";
import cors from "cors";

const openApiSpecPath = path.resolve(process.cwd(), "openapi.yaml");
const openApiSpec = YAML.parse(fs.readFileSync(openApiSpecPath, "utf-8"));

export function createApp(dependencies: AppDependencies) {
  const app = express();
  const router = Router();
  app.use(
    cors({
      origin: "http://localhost:4200",
    }),
  );

  app.use(express.json());
  app.get("/api/openapi.yaml", (_req, res) => {
    res.type("application/yaml").sendFile(openApiSpecPath);
  });
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use("/api", router);
  router.use("/claims", createClaimRouter(dependencies.claimService));
  router.use(
    "/claims/:id/damages",
    createDamageRouter(dependencies.damageService),
  );

  return app;
}
