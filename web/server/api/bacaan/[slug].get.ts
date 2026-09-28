import { getCatalog, findContent, sectionsFor } from "../../utils/catalog";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const catalog = await getCatalog();
  const content = slug ? findContent(catalog, slug) : null;

  if (!content) {
    throw createError({ statusCode: 404, statusMessage: "Bacaan tidak ditemukan" });
  }

  const category = catalog.categories.find((item) => item.id === content.category_id) || null;

  return {
    version: catalog.version,
    category,
    content,
    sections: sectionsFor(catalog, content),
  };
});
