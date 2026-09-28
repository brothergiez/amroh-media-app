import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { ApiKey } from "../models/ApiKey.js";
import { Category } from "../models/Category.js";
import { Content } from "../models/Content.js";
import { ContentSection } from "../models/ContentSection.js";
import { DatabaseVersion } from "../models/DatabaseVersion.js";
import { keyPrefix, sha256 } from "../utils/hash.js";
import { slugify } from "../utils/slugify.js";
import { writeSnapshot } from "./snapshotService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENTS_DIR = path.resolve(__dirname, "../../../contents");

const CATEGORIES = [
  { id: 1, name: "Group Amalan", slug: "amalan", sort_order: 1 },
  { id: 2, name: "Group Maulid", slug: "maulid", sort_order: 2 },
  { id: 3, name: "Sholawat & Qosidah", slug: "sholawat-qosidah", sort_order: 3 },
  { id: 4, name: "Group Tawassul", slug: "tawassul", sort_order: 4 },
];

const TITLE_CATEGORY = {
  "Doa Tawassul": "tawassul",
  "Tawassul Sayyidil Walid Habib Abdurrahman bin Ahmad Assegaf": "tawassul",
  "Ratib Al-Atthos": "amalan",
  "Hizib Nawawi": "amalan",
  "Niat Ta'lim": "amalan",
  "Sholawat Ya Robbana Tarofna": "amalan",
  "Dzikir Jalalah": "amalan",
  Penutup: "amalan",
  "Do'a Fajar": "amalan",
  "Wirdul Lathif": "amalan",
  "Surat Yaasin": "amalan",
  "Surat Waqi'ah": "amalan",
  "Surat Al-Mulk": "amalan",
  "Surat Al-Kahfi (10 Ayat Awal & 10 Ayat Akhir)": "amalan",
  "Hizib Nashr - Habib Abdullah bin Alawi Al-Haddad": "amalan",
  "Maulid Diba": "maulid",
  "Sholawat Busyro": "sholawat-qosidah",
  "Sholawat Untuk Keselamatan IB Habib Rizieq Syihab": "sholawat-qosidah",
  "Sholawat Dibaca Sebelum & Sesudah Belajar": "sholawat-qosidah",
  "Sholawat Kheir": "sholawat-qosidah",
};

const FILE_DEFAULT_CATEGORY = {
  "content1.json": "amalan",
  "content2.json": "amalan",
  "content3.json": "maulid",
  "content4.json": "sholawat-qosidah",
};

const SKIP = [{ file: "content1.json", title: "Sholawat Busyro" }];

function flattenSections(item) {
  const sections = [];
  if (item.type === "multiple") {
    for (const group of item.content || []) {
      const groupTitle = group.title || null;
      for (const bait of group.content || []) {
        sections.push({
          title: groupTitle,
          arabic: bait.bait || "",
          translation: bait.arti || "",
        });
      }
    }
    return sections;
  }

  for (const bait of item.content || []) {
    sections.push({
      title: null,
      arabic: bait.bait || "",
      translation: bait.arti || "",
    });
  }
  return sections;
}

async function upsertApiKey({ name, scope, rawKey }) {
  if (!rawKey) {
    return;
  }
  const key_hash = sha256(rawKey);
  await ApiKey.findOneAndUpdate(
    { scope },
    {
      name,
      key_hash,
      prefix: keyPrefix(rawKey),
      scope,
      is_active: true,
    },
    { upsert: true, new: true },
  );
}

export async function seedFromContents({ reset = true } = {}) {
  if (reset) {
    await Promise.all([
      Category.deleteMany({}),
      Content.deleteMany({}),
      ContentSection.deleteMany({}),
      DatabaseVersion.deleteMany({}),
    ]);
  }

  await upsertApiKey({
    name: "Flutter App",
    scope: "app",
    rawKey: env.appApiKey,
  });
  await upsertApiKey({
    name: "Admin CMS",
    scope: "admin",
    rawKey: env.adminApiKey,
  });

  const categoryBySlug = {};
  for (const category of CATEGORIES) {
    const doc = await Category.create({
      ...category,
      description: null,
      is_active: true,
    });
    categoryBySlug[doc.slug] = doc;
  }

  const files = ["content1.json", "content2.json", "content3.json", "content4.json"];
  const sortByCategory = {};
  let contentId = 1;
  let sectionId = 1;
  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const raw = await fs.readFile(path.join(CONTENTS_DIR, file), "utf8");
    const items = JSON.parse(raw);

    for (const item of items) {
      if (SKIP.some((rule) => rule.file === file && rule.title === item.title)) {
        skipped += 1;
        continue;
      }

      const slug = slugify(item.title);
      const existing = await Content.findOne({ slug });
      if (existing) {
        skipped += 1;
        continue;
      }

      const categorySlug =
        TITLE_CATEGORY[item.title] || FILE_DEFAULT_CATEGORY[file] || "amalan";
      const category = categoryBySlug[categorySlug];
      sortByCategory[category.id] = (sortByCategory[category.id] || 0) + 1;

      await Content.create({
        id: contentId,
        category_id: category.id,
        title: item.title,
        slug,
        description: null,
        content_type: item.type === "multiple" ? "multiple" : "single",
        numbering: Boolean(item.numbering),
        sort_order: sortByCategory[category.id],
        is_active: true,
        status: "published",
        source_file: file,
      });

      const sections = flattenSections(item);
      for (const [index, section] of sections.entries()) {
        await ContentSection.create({
          id: sectionId,
          content_id: contentId,
          section_type: "bacaan",
          title: section.title,
          arabic: section.arabic,
          transliteration: "",
          translation: section.translation,
          sort_order: index + 1,
        });
        sectionId += 1;
      }

      contentId += 1;
      imported += 1;
    }
  }

  const version = await writeSnapshot(1);
  return { imported, skipped, version: version.version };
}
