import express from "express";
import { Content } from "../../models/Content.js";
import { ContentSection } from "../../models/ContentSection.js";
import { getCurrentVersion } from "../../services/snapshotService.js";
import { serializeContent } from "../../utils/serialize.js";
import { escapeRegex } from "../../utils/escapeRegex.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const searchRouter = express.Router();

searchRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || "").trim();
    const current = await getCurrentVersion();

    if (q.length < 2) {
      return res.json({ version: current?.version ?? null, query: q, data: [] });
    }

    const regex = new RegExp(escapeRegex(q), "i");
    const titleMatches = await Content.find({
      is_active: true,
      status: "published",
      title: regex,
    })
      .sort({ category_id: 1, sort_order: 1 })
      .lean();

    const sectionMatches = await ContentSection.find({
      $or: [{ arabic: regex }, { translation: regex }, { title: regex }],
    })
      .sort({ content_id: 1, sort_order: 1 })
      .limit(80)
      .lean();

    const contentIds = [
      ...new Set([
        ...titleMatches.map((item) => item.id),
        ...sectionMatches.map((item) => item.content_id),
      ]),
    ];

    const contents = await Content.find({
      id: { $in: contentIds },
      is_active: true,
      status: "published",
    }).lean();
    const byId = Object.fromEntries(contents.map((item) => [item.id, item]));

    const data = contentIds
      .map((id) => byId[id])
      .filter(Boolean)
      .map((doc) => {
        const hit = sectionMatches.find((section) => section.content_id === doc.id);
        return serializeContent(doc, {
          match_title: Boolean(titleMatches.find((item) => item.id === doc.id)),
          snippet: hit
            ? {
                title: hit.title,
                translation: hit.translation,
                arabic: hit.arabic?.slice(0, 180) || "",
              }
            : null,
        });
      });

    res.json({
      version: current?.version ?? null,
      query: q,
      data,
    });
  }),
);
