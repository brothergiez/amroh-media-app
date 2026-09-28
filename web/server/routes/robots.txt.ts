export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const origin = config.public.siteUrl.replace(/\/$/, "");
  setHeader(event, "content-type", "text/plain; charset=utf-8");
  return `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`;
});
