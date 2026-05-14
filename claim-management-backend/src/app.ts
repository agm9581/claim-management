import express, { Router } from "express";
import swaggerUi from "swagger-ui-express";
import path from "node:path";
import fs from "node:fs";
import YAML from "yaml";
import ClaimRouter from "./router/claim.routes";
import DamageRouter from "./router/damage.routes";

const openApiSpecPath = path.resolve(process.cwd(), "openapi.yaml");
const openApiSpec = YAML.parse(fs.readFileSync(openApiSpecPath, "utf-8"));

export function createApp() {
  const app = express();
  const router = Router();

  app.use(express.json());
  app.get("/api/openapi.yaml", (_req, res) => {
    res.type("application/yaml").sendFile(openApiSpecPath);
  });
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use("/api", router);
  router.use("/claims", ClaimRouter);
  router.use("/claims/:id/damages", DamageRouter);

  return app;
}
