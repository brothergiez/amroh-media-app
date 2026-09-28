import mongoose from "mongoose";

const databaseVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true, unique: true },
    updated_at: { type: Date, required: true },
    size: { type: Number, required: true, default: 0 },
    checksum: { type: String, required: true },
    snapshot_path: { type: String, required: true },
    is_current: { type: Boolean, required: true, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export const DatabaseVersion = mongoose.model(
  "DatabaseVersion",
  databaseVersionSchema,
);
