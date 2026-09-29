<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Amalan · Maulid · Sholawat · Tawassul</p>
      <h1>Kumpulan bacaan {{ config.public.siteName }}</h1>
      <p class="lede">
        Dibaca langsung dari ponsel, dengan teks Arab yang nyaman dan terjemahan yang bisa disembunyikan.
      </p>
    </section>

    <CategoryBlock
      v-for="group in groups"
      :key="group.category.id"
      :category="group.category"
      :contents="group.contents"
    />
  </main>
</template>

<script setup lang="ts">
import type { Category, Content } from "~/types";

const config = useRuntimeConfig();
const { data, error } = await useFetch<{
  categories: Category[];
  contents: Content[];
}>("/api/catalog");

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 503,
    statusMessage: "Konten belum siap",
  });
}

const groups = computed(() =>
  (data.value?.categories || []).map((category) => ({
    category,
    contents: (data.value?.contents || [])
      .filter((item) => item.category_id === category.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  })),
);

useSeoMeta({
  title: config.public.siteName,
  description:
    "Bacaan majelis ta'lim: ratib, maulid, sholawat, qosidah, dan doa tawassul. Tampilan mobile-friendly.",
  ogTitle: config.public.siteName,
  ogDescription:
    "Kumpulan amalan, maulid, sholawat, dan tawassul untuk dibaca di majelis.",
  ogType: "website",
  ogUrl: config.public.siteUrl,
  twitterCard: "summary",
});

useHead({
  link: [{ rel: "canonical", href: `${config.public.siteUrl}/` }],
});
</script>

<style scoped>
.hero {
  padding: 1.4rem 0 0.4rem;
}

.hero h1 {
  font-size: clamp(2rem, 7vw, 3.4rem);
  line-height: 1.08;
  margin: 0.35rem 0 0.7rem;
}

.lede {
  color: var(--muted);
  font-size: 1.05rem;
  max-width: 36rem;
  margin: 0;
}
</style>
