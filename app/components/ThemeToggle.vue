<template>
  <button
    type="button"
    class="relative grid size-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:border-brand-500/60 hover:text-brand-600 dark:hover:text-brand-300"
    aria-label="Toggle color theme"
    @click="toggle"
  >
    <!-- Icons swap via the .dark class so SSR markup never mismatches. -->
    <svg class="size-[18px] dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
    <svg class="hidden size-[18px] dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  </button>
</template>

<script setup lang="ts">
const { sync, toggle } = useTheme()
onMounted(sync)
</script>
