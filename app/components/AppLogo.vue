<template>
  <NuxtLink :to="to" class="group inline-flex items-center gap-2.5 font-semibold tracking-tight text-fg">
    <span class="relative grid size-8 place-items-center rounded-lg bg-linear-to-br from-brand-400 to-brand-700 text-white shadow-md shadow-brand-700/30 transition group-hover:rotate-[-6deg]">
      <svg class="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 4h9l5 5v11H5z" opacity=".55" />
        <path d="M8 13l2.5 2.5L8 18M13 18h3" />
      </svg>
    </span>
    <span class="text-lg">Reflow</span>
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ to?: string }>(), { to: '/' })
</script>
