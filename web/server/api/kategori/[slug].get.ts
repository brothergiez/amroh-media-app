import { contentsByCategory, findCategory, getCatalog } from "../../utils/catalog";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const catalog = await getCatalog();
  const category = slug ? findCategory(catalog, slug) : null;

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: "Kategori tidak ditemukan" });
  }

  return {
    version: catalog.version,
    category,
    contents: contentsByCategory(catalog, category),
  };
});
