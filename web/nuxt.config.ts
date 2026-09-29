export default defineNuxtConfig({
  compatibilityDate: "2026-09-28",
  ssr: true,
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      htmlAttrs: { lang: "id" },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Noto+Naskh+Arabic:wght@500;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,700&family=Figtree:wght@400;500;600;700&display=swap",
        },
      ],
      meta: [
        { name: "theme-color", content: "#1f4d3a" },
        { name: "format-detection", content: "telephone=no" },
      ],
    },
  },
  runtimeConfig: {
    apiBase: "http://127.0.0.1:3000",
    apiKey: "",
    public: {
      siteUrl: "http://localhost:3001",
      siteName: "Majelis Ta'lim Al-Munawwaroh",
      siteDescription: "Lil Habib Zein bin Umar Al'Atthos",
      siteKeywords: ["Majelis Ta'lim Al-Munawwaroh", "Lil Habib Zein bin Umar Al'Atthos"],
      siteAuthor: "Majelis Ta'lim Al-Munawwaroh",
      siteAuthorEmail: "info@majelis-ta.com",
      siteAuthorUrl: "https://majelis-ta.com",
      siteAuthorLogo: "https://majelis-ta.com/logo.png",
      siteAuthorDescription: "Majelis Ta'lim Al-Munawwaroh",
    },
  },
  routeRules: {
    "/": { swr: 60 },
    "/kategori/**": { swr: 60 },
    "/bacaan/**": { swr: 300 },
  },
  nitro: {
    compressPublicAssets: true,
  },
});
