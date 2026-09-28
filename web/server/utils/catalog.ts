import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Catalog, Category, Content, ContentSection } from "../../types";

let cache: { at: number; data: Catalog } | null = null;
const TTL_MS = 30_000;

async function fromApi(): Promise<Catalog | null> {
  const config = useRuntimeConfig();
  if (!config.apiKey) {
    return null;
  }

  const response = await fetch(`${config.apiBase}/api/v1/database/download`, {
    headers: { "X-API-Key": config.apiKey },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as Catalog;
}

async function fromSnapshot(): Promise<Catalog> {
  const dir = join(process.cwd(), "../backend/storage/snapshots");
  const files = (await readdir(dir))
    .filter((name) => name.startsWith("majelis-v") && name.endsWith(".json"))
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

  if (!files.length) {
    throw createError({
      statusCode: 503,
      statusMessage: "Content catalog is not available",
    });
  }

  const raw = await readFile(join(dir, files[0]), "utf8");
  return JSON.parse(raw) as Catalog;
}

export async function getCatalog(): Promise<Catalog> {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return cache.data;
  }

  const data = (await fromApi().catch(() => null)) || (await fromSnapshot());
  cache = { at: Date.now(), data };
  return data;
}

export function contentsByCategory(catalog: Catalog, category: Category) {
  return catalog.contents
    .filter((item) => item.category_id === category.id)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

export function findCategory(catalog: Catalog, slug: string) {
  return catalog.categories.find((item) => item.slug === slug);
}

export function findContent(catalog: Catalog, slug: string) {
  return catalog.contents.find((item) => item.slug === slug);
}

export function sectionsFor(catalog: Catalog, content: Content): ContentSection[] {
  return catalog.sections
    .filter((item) => item.content_id === content.id)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}
