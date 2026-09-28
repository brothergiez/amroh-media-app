<template>
  <main class="page">
    <NuxtLink to="/" class="back">← Beranda</NuxtLink>
    <CategoryBlock v-if="data" :category="data.category" :contents="data.contents" />
  </main>
</template>

<script setup lang="ts">
import type { Category, Content } from "~/types";
import { categoryLabel } from "~/utils/category";

const route = useRoute();
const config = useRuntimeConfig();
const slug = computed(() => String(route.params.slug));

const { data, error } = await useFetch<{
  category: Category;
  contents: Content[];
}>(() => `/api/kategori/${slug.value}`);

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 404,
    statusMessage: "Kategori tidak ditemukan",
  });
}

const title = computed(() => categoryLabel(data.value?.category.name) || "Kategori");

useSeoMeta({
  title: () => `${title.value} · ${config.public.siteName}`,
  description: () => `Daftar bacaan pada ${title.value} di ${config.public.siteName}.`,
  ogTitle: () => `${title.value} · ${config.public.siteName}`,
  ogUrl: () => `${config.public.siteUrl}/kategori/${slug.value}`,
});

useHead({
  link: [{ rel: "canonical", href: `${config.public.siteUrl}/kategori/${slug.value}` }],
});
</script>

<style scoped>
.back {
  display: inline-flex;
  margin-bottom: 0.5rem;
  color: var(--muted);
}
</style>
