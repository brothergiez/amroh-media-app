<template>
  <svg
    class="ayah-frame"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="28"
    height="28"
    role="img"
    :aria-label="`Ayat ${number}`"
  >
    <path
      :d="outerPath"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linejoin="round"
    ></path>
    <path
      :d="innerPath"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    ></path>
    <circle cx="50" cy="14" r="2" fill="currentColor"></circle>
    <circle cx="50" cy="86" r="2" fill="currentColor"></circle>
    <circle cx="14" cy="50" r="2" fill="currentColor"></circle>
    <circle cx="86" cy="50" r="2" fill="currentColor"></circle>
    <text
      class="ayah-frame__num"
      x="50"
      y="48"
      :font-size="number >= 100 ? 18 : 24"
      font-weight="700"
      text-anchor="middle"
      dominant-baseline="central"
    >
      {{ number }}
    </text>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  number: number;
}>();

const outerPath =
  "M 50,4 C 56,12 66,16 74,16 C 80,16 84,20 84,26 C 84,34 88,44 96,50 C 88,56 84,66 84,74 C 84,80 80,84 74,84 C 66,84 56,88 50,96 C 44,88 34,84 26,84 C 20,84 16,80 16,74 C 16,66 12,56 4,50 C 12,44 16,34 16,26 C 16,20 20,16 26,16 C 34,16 44,12 50,4 Z";

const innerPath =
  "M 50,9 C 55,16 63,20 71,20 C 76,20 80,24 80,29 C 80,37 84,45 91,50 C 84,55 80,63 80,71 C 80,76 76,80 71,80 C 63,80 55,84 50,91 C 45,84 37,80 29,80 C 24,80 20,76 20,71 C 20,63 16,45 9,50 C 16,45 20,37 20,29 C 20,24 24,20 29,20 C 37,20 45,16 50,9 Z";
</script>

<style scoped>
.ayah-frame {
  display: inline-block;
  width: 1.9em;
  height: 1.9em;
  margin-inline: 0.22em;
  vertical-align: middle;
  overflow: visible;
  color: #a57c00;
}

.ayah-frame__num {
  font-family: Figtree, Arial, sans-serif;
  fill: #333333;
}

html[data-theme="dark"] .ayah-frame {
  color: #d4b36a;
}

html[data-theme="dark"] .ayah-frame__num {
  fill: #e3c57a;
}
</style>
