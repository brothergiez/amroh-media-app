<template>
  <div class="shell">
    <header class="top">
      <NuxtLink to="/" class="brand">
        <span class="mark" aria-hidden="true">م</span>
        <span>
          <strong>{{ siteName }}</strong>
          <small>Bacaan majelis, siap dibaca di mana saja</small>
        </span>
      </NuxtLink>
      <nav class="nav" aria-label="Utama">
        <NuxtLink to="/">Beranda</NuxtLink>
        <NuxtLink to="/cari">Cari</NuxtLink>
        <button type="button" class="ghost" @click="toggleTheme">
          {{ theme === "dark" ? "Terang" : "Gelap" }}
        </button>
      </nav>
    </header>
    <slot />
    <footer class="foot">
      <p>{{ siteName }} · konten dapat dibaca tanpa akun.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const siteName = config.public.siteName;
const theme = useCookie<"light" | "dark">("amroh-theme", {
  default: () => "light",
  sameSite: "lax",
});

function applyTheme(value: "light" | "dark") {
  if (import.meta.client) {
    document.documentElement.dataset.theme = value === "dark" ? "dark" : "";
  }
}

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  applyTheme(theme.value);
}

onMounted(() => applyTheme(theme.value));

useHead({
  htmlAttrs: {
    "data-theme": theme.value === "dark" ? "dark" : undefined,
  },
});
</script>

<style scoped>
.shell {
  min-height: 100vh;
}

.top {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.85rem 1rem;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}

.brand {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  min-width: 0;
}

.brand strong,
.brand small {
  display: block;
}

.brand small {
  color: var(--muted);
  font-size: 0.78rem;
}

.mark {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.85rem;
  display: grid;
  place-items: center;
  background: var(--green);
  color: #fffaf1;
  font-family: "Noto Naskh Arabic", serif;
  font-size: 1.3rem;
  flex: none;
}

.nav {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.nav a,
.ghost {
  border: 0;
  background: transparent;
  color: var(--ink);
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  font-size: 0.92rem;
}

.nav a.router-link-exact-active {
  background: var(--green);
  color: #fffaf1;
}

.foot {
  text-align: center;
  color: var(--muted);
  font-size: 0.86rem;
  padding: 1.5rem 1rem 2rem;
}

@media (max-width: 640px) {
  .brand small {
    display: none;
  }

  .nav a,
  .ghost {
    padding: 0.5rem 0.55rem;
  }
}
</style>
