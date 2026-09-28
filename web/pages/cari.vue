<template>
  <main class="page">
    <h1>Cari bacaan</h1>
    <label class="search">
      <span class="sr">Kata kunci</span>
      <input
        v-model="query"
        type="search"
        placeholder="Cari judul atau terjemahan"
        enterkeyhint="search"
      />
    </label>

    <ul class="results">
      <li v-for="item in results" :key="item.id">
        <NuxtLink :to="`/bacaan/${item.slug}`">{{ item.title }}</NuxtLink>
      </li>
    </ul>
    <p v-if="query && !results.length" class="empty">Tidak ada bacaan yang cocok.</p>
  </main>
</template>

<script setup lang="ts">
import type { Content } from "~/types";

const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();
const query = ref(String(route.query.q || ""));

const { data } = await useFetch<{ contents: Content[] }>("/api/catalog");

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  const items = data.value?.contents || [];
  if (!q) {
    return items;
  }
  return items.filter((item) => item.title.toLowerCase().includes(q));
});

watch(query, (value) => {
  router.replace({ query: value ? { q: value } : {} });
});

useSeoMeta({
  title: `Cari · ${config.public.siteName}`,
  description: `Cari bacaan majelis di ${config.public.siteName}.`,
  robots: query.value ? "noindex,follow" : "index,follow",
});
</script>

<style scoped>
h1 {
  font-size: 2rem;
}

.search input {
  width: 100%;
  margin-top: 0.8rem;
  border: 1px solid var(--line);
  background: var(--bg-elevated);
  color: var(--ink);
  border-radius: 1rem;
  padding: 0.95rem 1rem;
  font-size: 1rem;
}

.results {
  list-style: none;
  padding: 1rem 0 0;
  margin: 0;
}

.results a {
  display: block;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--line);
}

.empty,
.sr {
  color: var(--muted);
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
