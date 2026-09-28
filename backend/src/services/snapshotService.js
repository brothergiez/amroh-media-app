import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sha256 } from "../utils/hash.js";
import { serializeCategory, serializeContent, serializeSection } from "../utils/serialize.js";
import { Category } from "../models/Category.js";
import { Content } from "../models/Content.js";
import { ContentSection } from "../models/ContentSection.js";
import { DatabaseVersion } from "../models/DatabaseVersion.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SNAPSHOT_DIR = path.resolve(__dirname, "../../storage/snapshots");

export async function writeSnapshot(version = 1) {
  const [categories, contents, sections] = await Promise.all([
    Category.find({ is_active: true }).sort({ sort_order: 1, id: 1 }).lean(),
    Content.find({ is_active: true, status: "published" })
      .sort({ category_id: 1, sort_order: 1, id: 1 })
      .lean(),
    ContentSection.find().sort({ content_id: 1, sort_order: 1, id: 1 }).lean(),
  ]);

  const payload = {
    version,
    updated_at: new Date().toISOString(),
    categories: categories.map(serializeCategory),
    contents: contents.map((doc) => serializeContent(doc)),
    sections: sections.map(serializeSection),
  };

  await fs.mkdir(SNAPSHOT_DIR, { recursive: true });
  const filename = `majelis-v${version}.json`;
  const snapshotPath = path.join(SNAPSHOT_DIR, filename);
  const body = JSON.stringify(payload);
  await fs.writeFile(snapshotPath, body, "utf8");

  const checksum = `sha256:${sha256(body)}`;
  const size = Buffer.byteLength(body);

  await DatabaseVersion.updateMany({}, { $set: { is_current: false } });
  const record = await DatabaseVersion.findOneAndUpdate(
    { version },
    {
      version,
      updated_at: new Date(),
      size,
      checksum,
      snapshot_path: snapshotPath,
      is_current: true,
    },
    { upsert: true, new: true },
  );

  return record;
}

export async function getCurrentVersion() {
  return DatabaseVersion.findOne({ is_current: true }).lean();
}
