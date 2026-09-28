<template>
  <main class="page">
    <h1>Halaman tidak ditemukan</h1>
    <p>Bacaan atau kategori yang dicari tidak ada.</p>
    <NuxtLink to="/">Kembali ke beranda</NuxtLink>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Tidak ditemukan",
  robots: "noindex,follow",
});
</script>
