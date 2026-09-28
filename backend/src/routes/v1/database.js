import express from "express";
import { getCurrentVersion } from "../../services/snapshotService.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const databaseRouter = express.Router();

databaseRouter.get(
  "/version",
  asyncHandler(async (req, res) => {
  const current = await getCurrentVersion();
  if (!current) {
    return res.status(404).json({
      error: "not_found",
      message: "Database version is not published yet",
    });
  }

  res.json({
    version: current.version,
    updated_at: current.updated_at,
    size: current.size,
    checksum: current.checksum,
    download_url: `/api/v1/database/download/${current.version}`,
  });
  }),
);

databaseRouter.get(
  "/download/:version?",
  asyncHandler(async (req, res) => {
  const current = await getCurrentVersion();
  if (!current) {
    return res.status(404).json({
      error: "not_found",
      message: "Database snapshot is not available",
    });
  }

  const requested = req.params.version
    ? Number(req.params.version)
    : current.version;

  if (requested !== current.version) {
    return res.status(404).json({
      error: "not_found",
      message: `Snapshot version ${requested} is not available`,
    });
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="majelis-v${current.version}.json"`,
  );
  res.setHeader("X-Checksum", current.checksum);
  res.sendFile(current.snapshot_path);
  }),
);
