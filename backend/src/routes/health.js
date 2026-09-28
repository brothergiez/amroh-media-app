import express from "express";
import { getMongoHealth } from "../config/mongodb.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get(
  "/ready",
  asyncHandler(async (req, res) => {
    const mongodb = await getMongoHealth();
    const ready = mongodb.ok;

    res.status(ready ? 200 : 503).json({
      status: ready ? "ok" : "unhealthy",
      checks: {
        mongodb: mongodb.status,
      },
      timestamp: new Date().toISOString(),
    });
  }),
);
