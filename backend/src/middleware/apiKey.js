import { ApiKey } from "../models/ApiKey.js";
import { sha256 } from "../utils/hash.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const apiKey = asyncHandler(async (req, res, next) => {
  const raw = req.header("X-API-Key");
  if (!raw) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Missing or invalid API key",
    });
  }

  const record = await ApiKey.findOne({
    key_hash: sha256(raw),
    is_active: true,
  });

  if (!record) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Missing or invalid API key",
    });
  }

  req.apiKey = record;
  record.last_used_at = new Date();
  record.save().catch(() => {});
  next();
});
