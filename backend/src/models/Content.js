import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    category_id: { type: Number, required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    content_type: { type: String, enum: ["single", "multiple"], default: "single" },
    numbering: { type: Boolean, default: false },
    sort_order: { type: Number, required: true, default: 0 },
    is_active: { type: Boolean, required: true, default: true },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    source_file: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const Content = mongoose.model("Content", contentSchema);
