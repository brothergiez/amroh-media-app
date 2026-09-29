<template>
  <main class="page reader">
    <header class="toolbar">
      <NuxtLink :to="categoryLink" class="back">← {{ categoryLabel(data?.category?.name) || "Kembali" }}</NuxtLink>
      <div class="tools">
        <button type="button" @click="fontSize = Math.max(1.1, Number(fontSize) - 0.1)">A-</button>
        <button type="button" @click="fontSize = Math.min(2.2, Number(fontSize) + 0.1)">A+</button>
        <button v-if="hasTranslation" type="button" @click="showTranslation = !showTranslation">
          {{ showTranslation ? "Sembunyikan arti" : "Tampilkan arti" }}
        </button>
      </div>
    </header>

    <h1>{{ data?.content.title }}</h1>
    <p v-if="data?.content.description" class="desc">{{ data.content.description }}</p>

    <MushafPage
      v-if="data"
      :slug="slug"
      :sections="data.sections"
      :font-size="Number(fontSize)"
      :numbering="Boolean(data.content.numbering)"
      :show-translation="showTranslation"
    />
  </main>
</template>

<script setup lang="ts">
import type { Category, Content, ContentSection } from "~/types";
import { categoryLabel } from "~/utils/category";

const route = useRoute();
const config = useRuntimeConfig();
const slug = computed(() => String(route.params.slug));
const fontSize = useCookie<number>("amroh-font", { default: () => 1.45, sameSite: "lax" });
const showTranslation = useCookie<boolean>("amroh-show-arti", { default: () => false, sameSite: "lax" });

const { data, error } = await useFetch<{
  category: Category | null;
  content: Content;
  sections: ContentSection[];
}>(() => `/api/bacaan/${slug.value}`);

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 404,
    statusMessage: "Bacaan tidak ditemukan",
  });
}

const categoryLink = computed(() =>
  data.value?.category ? `/kategori/${data.value.category.slug}` : "/",
);

const hasTranslation = computed(() =>
  Boolean(data.value?.sections.some((item) => item.translation?.trim())),
);

const preview = computed(
  () => data.value?.sections.find((item) => item.translation)?.translation || data.value?.content.title,
);

useSeoMeta({
  title: () => `${data.value?.content.title} · ${config.public.siteName}`,
  description: () => preview.value,
  ogTitle: () => `${data.value?.content.title} · ${config.public.siteName}`,
  ogDescription: () => preview.value,
  ogType: "article",
  ogUrl: () => `${config.public.siteUrl}/bacaan/${slug.value}`,
});

useHead({
  link: [{ rel: "canonical", href: `${config.public.siteUrl}/bacaan/${slug.value}` }],
});
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
  position: sticky;
  top: 4.1rem;
  padding: 0.55rem 0;
  background: color-mix(in srgb, var(--bg) 92%, transparent);
}

.back {
  color: var(--muted);
}

.tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tools button {
  border: 1px solid var(--line);
  background: var(--bg-elevated);
  color: var(--ink);
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  min-height: 2.5rem;
}

h1 {
  font-size: clamp(1.7rem, 6vw, 2.5rem);
  margin: 0 0 1rem;
}

.desc {
  color: var(--muted);
}
</style>
