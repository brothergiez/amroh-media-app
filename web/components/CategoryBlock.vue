<template>
  <article>
    <header class="group-head">
      <p class="eyebrow">{{ categoryLabel(category.name) }}</p>
      <h2>{{ categoryLabel(category.name) }}</h2>
    </header>
    <ol class="list">
      <li v-for="item in contents" :key="item.id">
        <NuxtLink :to="`/bacaan/${item.slug}`" class="row">
          <span>{{ item.title }}</span>
          <span class="go" aria-hidden="true">←</span>
        </NuxtLink>
      </li>
    </ol>
  </article>
</template>

<script setup lang="ts">
import type { Category, Content } from "~/types";
import { categoryLabel } from "~/utils/category";

defineProps<{
  category: Category;
  contents: Content[];
}>();
</script>

<style scoped>
.group-head {
  margin: 2rem 0 0.85rem;
}

.group-head h2 {
  margin: 0.2rem 0 0;
  font-size: 1.55rem;
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
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1rem;
  border-bottom: 1px solid var(--line);
  min-height: 3.1rem;
  align-items: center;
}

.list li:last-child .row {
  border-bottom: 0;
}

.go {
  color: var(--gold);
  transform: scaleX(-1);
}

.row:active {
  background: color-mix(in srgb, var(--gold) 10%, transparent);
}
</style>
