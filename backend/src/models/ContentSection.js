import mongoose from "mongoose";

const contentSectionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    content_id: { type: Number, required: true, index: true },
    section_type: { type: String, required: true, default: "bacaan" },
    title: { type: String, default: null },
    arabic: { type: String, default: "" },
    transliteration: { type: String, default: "" },
    translation: { type: String, default: "" },
    sort_order: { type: Number, required: true, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const ContentSection = mongoose.model(
  "ContentSection",
  contentSectionSchema,
);
