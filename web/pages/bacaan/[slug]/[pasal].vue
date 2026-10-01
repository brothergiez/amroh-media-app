<template>
  <main class="page reader">
    <header class="toolbar">
      <NuxtLink :to="`/bacaan/${slug}`" class="back">← {{ data?.content.title }}</NuxtLink>
      <div class="tools">
        <button type="button" @click="fontSize = Math.max(1.1, Number(fontSize) - 0.1)">A-</button>
        <button type="button" @click="fontSize = Math.min(2.2, Number(fontSize) + 0.1)">A+</button>
        <button v-if="hasTranslation" type="button" @click="showTranslation = !showTranslation">
          {{ showTranslation ? "Sembunyikan arti" : "Tampilkan arti" }}
        </button>
      </div>
    </header>

    <p class="eyebrow">{{ data?.content.title }} · Pasal {{ current?.index }}</p>
    <h1 dir="rtl" lang="ar">{{ current?.title }}</h1>

    <MushafPage
      v-if="current"
      :slug="slug"
      :sections="current.sections"
      :font-size="Number(fontSize)"
      :numbering="Boolean(data?.content.numbering)"
      :show-translation="showTranslation"
      hide-group-title
    />

    <nav class="pager" aria-label="Pasal">
      <NuxtLink v-if="prev" :to="`/bacaan/${slug}/${prev.index}`" class="pager-link">
        ← Pasal {{ prev.index }}
      </NuxtLink>
      <span v-else />
      <NuxtLink v-if="next" :to="`/bacaan/${slug}/${next.index}`" class="pager-link">
        Pasal {{ next.index }} →
      </NuxtLink>
    </nav>
  </main>
</template>

<script setup lang="ts">
import type { Category, Content, ContentSection } from "~/types";
import { pasalFromSections, shouldIndexPasal } from "~/utils/pasal";

const route = useRoute();
const config = useRuntimeConfig();
const slug = computed(() => String(route.params.slug));
const pasalIndex = computed(() => Number(route.params.pasal));
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

if (!shouldIndexPasal(data.value?.content.content_type || "single", pasal.value)) {
  await navigateTo(`/bacaan/${slug.value}`, { redirectCode: 301 });
}

const current = computed(() => pasal.value.find((item) => item.index === pasalIndex.value));

if (!current.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Pasal tidak ditemukan",
  });
}

const prev = computed(() => pasal.value.find((item) => item.index === pasalIndex.value - 1));
const next = computed(() => pasal.value.find((item) => item.index === pasalIndex.value + 1));

const hasTranslation = computed(() =>
  Boolean(current.value?.sections.some((item) => item.translation?.trim())),
);

useSeoMeta({
  title: () => `${current.value?.title} · ${data.value?.content.title}`,
  description: () => `Pasal ${current.value?.index} ${data.value?.content.title}: ${current.value?.title}`,
  ogTitle: () => `${current.value?.title} · ${data.value?.content.title}`,
  ogType: "article",
  ogUrl: () => `${config.public.siteUrl}/bacaan/${slug.value}/${pasalIndex.value}`,
});

useHead({
  link: [{ rel: "canonical", href: `${config.public.siteUrl}/bacaan/${slug.value}/${pasalIndex.value}` }],
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

.eyebrow {
  color: var(--gold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 700;
  margin: 0;
}

h1 {
  font-family: "Noto Naskh Arabic", serif;
  font-size: clamp(1.5rem, 5vw, 2.2rem);
  margin: 0.35rem 0 1rem;
}

.pager {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
}

.pager-link {
  color: var(--muted);
  min-height: 2.5rem;
  display: inline-flex;
  align-items: center;
}
</style>
