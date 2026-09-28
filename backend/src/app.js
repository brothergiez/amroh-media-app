import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { apiKey } from "./middleware/apiKey.js";
import { requireAnyScope, requireScope } from "./middleware/requireScope.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./routes/health.js";
import { databaseRouter } from "./routes/v1/database.js";
import { categoriesRouter } from "./routes/v1/categories.js";
import { contentsRouter } from "./routes/v1/contents.js";
import { adminRouter } from "./routes/v1/admin.js";
import { openapiSpec } from "./docs/openapi.js";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "2mb" }));
  app.use(
    cors({
      origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(","),
    }),
  );
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use("/health", healthRouter);
  app.get("/openapi.json", (req, res) => {
    res.json(openapiSpec);
  });
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      customSiteTitle: "Amroh API Docs",
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );

  app.use("/api/v1", apiKey);
  app.use("/api/v1/database", requireAnyScope("app", "admin"), databaseRouter);
  app.use("/api/v1/categories", requireAnyScope("app", "admin"), categoriesRouter);
  app.use("/api/v1/contents", requireAnyScope("app", "admin"), contentsRouter);
  app.use("/api/v1/admin", requireScope("admin"), adminRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "not_found", message: "Route not found" });
  });
  app.use(errorHandler);

  return app;
}
