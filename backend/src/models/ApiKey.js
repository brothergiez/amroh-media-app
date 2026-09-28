import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    key_hash: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    scope: { type: String, enum: ["app", "admin"], required: true },
    is_active: { type: Boolean, required: true, default: true },
    last_used_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const ApiKey = mongoose.model("ApiKey", apiKeySchema);
