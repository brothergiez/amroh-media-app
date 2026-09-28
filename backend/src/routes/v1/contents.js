import express from "express";
import { Category } from "../../models/Category.js";
import { Content } from "../../models/Content.js";
import { ContentSection } from "../../models/ContentSection.js";
import { getCurrentVersion } from "../../services/snapshotService.js";
import { serializeContent, serializeSection } from "../../utils/serialize.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const contentsRouter = express.Router();

contentsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
  const filter = { is_active: true, status: "published" };

  if (req.query.category) {
    const category = await Category.findOne({
      slug: req.query.category,
      is_active: true,
    }).lean();
    if (!category) {
      return res.status(404).json({
        error: "not_found",
        message: "Category not found",
      });
    }
    filter.category_id = category.id;
  }

  const [current, contents] = await Promise.all([
    getCurrentVersion(),
    Content.find(filter).sort({ category_id: 1, sort_order: 1, id: 1 }).lean(),
  ]);

  res.json({
    version: current?.version ?? null,
    data: contents.map((doc) => serializeContent(doc)),
  });
  }),
);

contentsRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
  const content = await Content.findOne({
    slug: req.params.slug,
    is_active: true,
    status: "published",
  }).lean();

  if (!content) {
    return res.status(404).json({
      error: "not_found",
      message: "Content not found",
    });
  }

  const [current, sections] = await Promise.all([
    getCurrentVersion(),
    ContentSection.find({ content_id: content.id })
      .sort({ sort_order: 1, id: 1 })
      .lean(),
  ]);

  res.json({
    version: current?.version ?? null,
    data: serializeContent(content, {
      sections: sections.map(serializeSection),
    }),
  });
  }),
);
