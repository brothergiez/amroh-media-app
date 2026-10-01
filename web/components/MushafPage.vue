<template>
  <article class="sheet">
    <p v-if="arabicTitle" class="surah" dir="rtl" lang="ar">{{ arabicTitle }}</p>
    <p v-if="bismillah" class="bismillah" dir="rtl" lang="ar">{{ bismillah }}</p>

    <section v-for="(group, groupIndex) in groups" :key="groupIndex" class="block">
      <h2 v-if="group.title && !hideGroupTitle" class="part" dir="rtl" lang="ar">{{ group.title }}</h2>
      <p
        v-if="numbering"
        class="body"
        dir="rtl"
        lang="ar"
        :style="{ fontSize: `${fontSize}rem` }"
      >
        <template v-for="(ayah, index) in group.items" :key="ayah.id">
          <span
            v-if="ayah.number === 101 && group.items[index - 1]?.number === 10"
            class="skip"
          >
            ۞ sepuluh ayat terakhir ۞
          </span>
          <span class="ayah">
            <template v-for="(line, lineIndex) in ayah.arabic.split('\n')" :key="lineIndex">
              <br v-if="lineIndex > 0" />{{ line }}
            </template>
            <AyahMarker v-if="ayah.number != null" :number="ayah.number" />
          </span>
        </template>
      </p>
      <template v-else>
        <p
          v-for="ayah in group.items"
          :key="ayah.id"
          class="body bait"
          dir="rtl"
          lang="ar"
          :style="{ fontSize: `${fontSize}rem` }"
        >
          <template v-for="(line, lineIndex) in ayah.arabic.split('\n')" :key="lineIndex">
            <br v-if="lineIndex > 0" />{{ line }}
          </template>
        </p>
      </template>
      <div v-if="showTranslation && group.items.some((item) => item.translation)" class="arti-list">
        <p v-for="ayah in group.items.filter((item) => item.translation)" :key="`t-${ayah.id}`" class="arti">
          <span v-if="ayah.number != null" class="arti-num">{{ ayah.number }}.</span>
          {{ ayah.translation }}
        </p>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import type { ContentSection } from "~/types";
import { buildMushafView } from "~/utils/mushaf";

const props = defineProps<{
  slug: string;
  sections: ContentSection[];
  fontSize: number;
  numbering?: boolean;
  showTranslation?: boolean;
  hideGroupTitle?: boolean;
}>();

const parsed = computed(() =>
  buildMushafView(props.slug, props.sections, Boolean(props.numbering)),
);
const arabicTitle = computed(() => parsed.value.arabicTitle);
const bismillah = computed(() => parsed.value.bismillah);
const groups = computed(() => parsed.value.groups);
</script>

<style scoped>
.sheet {
  --page: #f6edd4;
  background:
    linear-gradient(180deg, rgba(176, 137, 62, 0.08), transparent 18%),
    var(--page);
  color: #1a140c;
  border: 10px double #c4a24a;
  border-radius: 0.35rem;
  padding: 1.1rem 1rem 1.6rem;
  box-shadow:
    inset 0 0 0 1px #efe2bf,
    0 10px 28px rgba(28, 25, 20, 0.08);
}

.surah,
.bismillah,
.part {
  font-family: "Amiri Quran", "Noto Naskh Arabic", serif;
  text-align: center;
  margin: 0;
}

.surah {
  font-size: 1.55rem;
  color: #6d5420;
  margin-bottom: 0.35rem;
}

.bismillah {
  font-size: 1.45rem;
  margin: 0.2rem 0 0.85rem;
}

.block + .block {
  margin-top: 1.1rem;
}

.part {
  font-size: 1.25rem;
  color: #6d5420;
  margin-bottom: 0.45rem;
}

.body {
  font-family: "Amiri Quran", "Noto Naskh Arabic", serif;
  font-weight: 400;
  line-height: 2.55;
  text-align: justify;
  text-align-last: center;
  margin: 0;
}

.ayah {
  unicode-bidi: isolate;
}

.bait {
  margin: 0 0 1.1em;
  text-align-last: right;
}

.bait:last-of-type {
  margin-bottom: 0;
}

.skip {
  display: block;
  text-align: center;
  text-align-last: center;
  font-family: Figtree, system-ui, sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: #8a7342;
  margin: 0.85rem 0;
}

.arti-list {
  margin-top: 0.9rem;
  text-align: left;
  direction: ltr;
}

.arti {
  margin: 0 0 0.45rem;
  color: #6b6458;
  font-size: 0.92rem;
  line-height: 1.45;
}

.arti-num {
  color: #a57c00;
  font-weight: 700;
  margin-right: 0.25rem;
}

html[data-theme="dark"] .sheet {
  --page: #1c1a14;
  background:
    linear-gradient(180deg, rgba(212, 179, 106, 0.1), transparent 22%),
    var(--page);
  color: #f3ece1;
  border-color: #8a7342;
  box-shadow: inset 0 0 0 1px #3a3428;
}

html[data-theme="dark"] .surah,
html[data-theme="dark"] .part {
  color: #e3c57a;
}

html[data-theme="dark"] .skip,
html[data-theme="dark"] .arti {
  color: #cbb68a;
}
</style>
