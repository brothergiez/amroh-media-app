<template>
  <main class="page" :class="{ reader: !showPasalIndex }">
    <header class="toolbar">
      <NuxtLink :to="categoryLink" class="back">← {{ categoryLabel(data?.category?.name) || "Kembali" }}</NuxtLink>
      <div v-if="!showPasalIndex" class="tools">
        <button type="button" @click="fontSize = Math.max(1.1, Number(fontSize) - 0.1)">A-</button>
        <button type="button" @click="fontSize = Math.min(2.2, Number(fontSize) + 0.1)">A+</button>
        <button v-if="hasTranslation" type="button" @click="showTranslation = !showTranslation">
          {{ showTranslation ? "Sembunyikan arti" : "Tampilkan arti" }}
        </button>
      </div>
    </header>

    <h1>{{ data?.content.title }}</h1>
    <p v-if="data?.content.description" class="desc">{{ data.content.description }}</p>

    <ol v-if="showPasalIndex" class="list">
      <li v-for="item in pasal" :key="item.index">
        <NuxtLink :to="`/bacaan/${slug}/${item.index}`" class="row">
          <span class="num">{{ item.index }}</span>
          <span class="title" dir="rtl" lang="ar">{{ item.title }}</span>
          <span class="go" aria-hidden="true">←</span>
        </NuxtLink>
      </li>
    </ol>

    <MushafPage
      v-else-if="data"
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
import { pasalFromSections, shouldIndexPasal } from "~/utils/pasal";

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

const pasal = computed(() => pasalFromSections(data.value?.sections || []));
const showPasalIndex = computed(() =>
  shouldIndexPasal(data.value?.content.content_type || "single", pasal.value),
);

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
  description: () =>
    showPasalIndex.value
      ? `Daftar pasal ${data.value?.content.title} di ${config.public.siteName}.`
      : preview.value,
  ogTitle: () => `${data.value?.content.title} · ${config.public.siteName}`,
  ogDescription: () => preview.value,
  ogType: "website",
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

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--line);
  border-radius: 1.1rem;
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  border-bottom: 1px solid var(--line);
  min-height: 3.1rem;
}

.list li:last-child .row {
  border-bottom: 0;
}

.num {
  color: var(--gold);
  font-variant-numeric: tabular-nums;
  min-width: 1.4rem;
}

.title {
  flex: 1;
  font-family: "Noto Naskh Arabic", serif;
  font-size: 1.15rem;
}

.go {
  color: var(--gold);
  transform: scaleX(-1);
}

.row:active {
  background: color-mix(in srgb, var(--gold) 10%, transparent);
}
</style>
