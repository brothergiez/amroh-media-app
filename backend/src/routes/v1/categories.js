import express from "express";
import { Category } from "../../models/Category.js";
import { getCurrentVersion } from "../../services/snapshotService.js";
import { serializeCategory } from "../../utils/serialize.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const categoriesRouter = express.Router();

categoriesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
  const [current, categories] = await Promise.all([
    getCurrentVersion(),
    Category.find({ is_active: true }).sort({ sort_order: 1, id: 1 }).lean(),
  ]);

  res.json({
    version: current?.version ?? null,
    data: categories.map(serializeCategory),
  });
  }),
);
