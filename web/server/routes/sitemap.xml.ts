import { getCatalog } from "../utils/catalog";

export default defineEventHandler(async (event) => {
  const catalog = await getCatalog();
  const config = useRuntimeConfig();
  const origin = config.public.siteUrl.replace(/\/$/, "");

  const urls = [
    { loc: `${origin}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${origin}/cari`, changefreq: "weekly", priority: "0.4" },
    ...catalog.categories.map((category) => ({
      loc: `${origin}/kategori/${category.slug}`,
      changefreq: "weekly",
      priority: "0.8",
    })),
    ...catalog.contents.map((content) => ({
      loc: `${origin}/bacaan/${content.slug}`,
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  setHeader(event, "content-type", "application/xml; charset=utf-8");
  return body;
});
