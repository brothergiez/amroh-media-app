import express from "express";
import { DatabaseVersion } from "../../models/DatabaseVersion.js";
import { writeSnapshot } from "../../services/snapshotService.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const adminRouter = express.Router();

adminRouter.post(
  "/publish",
  asyncHandler(async (req, res) => {
  const latest = await DatabaseVersion.findOne().sort({ version: -1 }).lean();
  const nextVersion = (latest?.version || 0) + 1;
  const record = await writeSnapshot(nextVersion);

  res.json({
    version: record.version,
    updated_at: record.updated_at,
    size: record.size,
    checksum: record.checksum,
    download_url: `/api/v1/database/download/${record.version}`,
  });
  }),
);
