<template>
  <main class="page reader">
    <header class="toolbar">
      <NuxtLink :to="categoryLink" class="back">← {{ categoryLabel(data?.category?.name) || "Kembali" }}</NuxtLink>
      <div class="tools">
        <button type="button" @click="fontSize = Math.max(1.1, Number(fontSize) - 0.1)">A-</button>
        <button type="button" @click="fontSize = Math.min(2.2, Number(fontSize) + 0.1)">A+</button>
        <button type="button" @click="showTranslation = !showTranslation">
          {{ showTranslation ? "Sembunyikan arti" : "Tampilkan arti" }}
        </button>
      </div>
    </header>

    <h1>{{ data?.content.title }}</h1>
    <p v-if="data?.content.description" class="desc">{{ data.content.description }}</p>

    <section v-for="(group, index) in groups" :key="index" class="block">
      <h2 v-if="group.title" class="part" dir="rtl">{{ group.title }}</h2>
      <article
        v-for="(section, i) in group.items"
        :key="section.id"
        class="verse"
      >
        <span v-if="data?.content.numbering" class="num">{{ i + 1 }}</span>
        <p class="arabic" :style="{ fontSize: `${Number(fontSize)}rem` }">{{ section.arabic }}</p>
        <p v-if="section.transliteration" class="latin">{{ section.transliteration }}</p>
        <p v-if="showTranslation && section.translation" class="arti">{{ section.translation }}</p>
      </article>
    </section>
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

const groups = computed(() => {
  const result: { title: string | null; items: ContentSection[] }[] = [];
  for (const section of data.value?.sections || []) {
    const last = result[result.length - 1];
    if (last && last.title === section.title) {
      last.items.push(section);
    } else {
      result.push({ title: section.title, items: [section] });
    }
  }
  return result;
});

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

.desc,
.latin,
.arti {
  color: var(--muted);
}

.block {
  margin: 0.5rem 0 1rem;
}

.part {
  font-family: "Noto Naskh Arabic", serif;
  font-size: 1.2rem;
  margin: 0.7rem 0 0.35rem;
}

.verse {
  padding: 0.12rem 0;
}

.verse p {
  margin: 0;
}

.num {
  color: var(--gold);
  font-size: 0.8rem;
}

.latin {
  margin: 0.1rem 0 0;
  line-height: 1.4;
  font-size: 0.92rem;
}

.arti {
  margin: 0.1rem 0 0.15rem;
  line-height: 1.4;
  font-size: 0.92rem;
}
</style>
