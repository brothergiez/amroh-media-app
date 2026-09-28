import { getCatalog } from "../utils/catalog";

export default defineEventHandler(async () => {
  const catalog = await getCatalog();
  return {
    version: catalog.version,
    updated_at: catalog.updated_at,
    categories: catalog.categories,
    contents: catalog.contents,
  };
});
