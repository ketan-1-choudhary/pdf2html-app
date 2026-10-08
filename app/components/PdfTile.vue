<template>
  <NuxtLink
    :to="`/pdf/${pdf.pdf_id}/page/1`"
    class="card group relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-900/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:hover:shadow-black/40"
  >
    <!-- Preview -->
    <div class="relative aspect-[4/3] overflow-hidden bg-surface-2">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgb(20_184_166/0.18),transparent_60%)] opacity-0 transition duration-500 group-hover:opacity-100" />
      <div class="absolute top-5 left-1/2 w-[58%] -translate-x-1/2 rounded-sm bg-white p-3 shadow-lg shadow-zinc-900/10 transition duration-500 group-hover:-translate-y-1 group-hover:rotate-[-1.5deg] dark:bg-zinc-100">
        <div class="h-2 w-3/5 rounded-sm bg-brand-600/80" />
        <div class="mt-2.5 space-y-1">
          <div class="h-1 w-full rounded-sm bg-zinc-300" />
          <div class="h-1 w-11/12 rounded-sm bg-zinc-300" />
          <div class="h-1 w-4/5 rounded-sm bg-zinc-300" />
        </div>
        <div class="mt-2.5 grid grid-cols-2 gap-1.5">
          <div class="aspect-[4/3] rounded-sm bg-zinc-200" />
          <div class="space-y-1">
            <div class="h-1 w-full rounded-sm bg-zinc-300" />
            <div class="h-1 w-5/6 rounded-sm bg-zinc-300" />
            <div class="h-1 w-full rounded-sm bg-zinc-300" />
            <div class="h-1 w-2/3 rounded-sm bg-zinc-300" />
          </div>
        </div>
        <div class="mt-2.5 space-y-1">
          <div class="h-1 w-full rounded-sm bg-zinc-300" />
          <div class="h-1 w-3/4 rounded-sm bg-zinc-300" />
        </div>
      </div>

      <span class="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 backdrop-blur" :class="badge.class">
        <span class="relative flex size-1.5">
          <span v-if="status === 'converting'" class="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
          <span class="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
        {{ badge.label }}
      </span>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col gap-3 border-t border-line p-4">
      <div class="flex items-start gap-2.5">
        <svg class="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
        <h3 class="truncate text-sm font-semibold" :title="pdf.pdf_name">{{ pdf.pdf_name }}</h3>
      </div>

      <div class="mt-auto">
        <div class="mb-1.5 flex justify-between text-xs text-muted">
          <span>{{ pdf.total_pages ? `${pdf.completed_pages} / ${pdf.total_pages} pages` : 'Waiting to start' }}</span>
          <span class="tabular-nums">{{ percent }}%</span>
        </div>
        <div class="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            class="h-full rounded-full transition-[width] duration-700"
            :class="status === 'ready' ? 'bg-brand-500' : 'bg-linear-to-r from-brand-400 to-brand-600'"
            :style="{ width: `${percent}%` }"
          />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
export interface PdfSummary {
  pdf_id: string
  pdf_name: string
  completed_pages: number
  total_pages: number
}

const props = defineProps<{ pdf: PdfSummary }>()

const status = computed<'queued' | 'converting' | 'ready'>(() => {
  const { completed_pages: done, total_pages: total } = props.pdf
  if (!total) return 'queued'
  return done >= total ? 'ready' : 'converting'
})

const percent = computed(() => {
  const { completed_pages: done, total_pages: total } = props.pdf
  return total ? Math.min(100, Math.round((done / total) * 100)) : 0
})

const badges = {
  queued: { label: 'Queued', class: 'bg-zinc-500/10 text-zinc-600 ring-zinc-500/25 dark:text-zinc-300' },
  converting: { label: 'Converting', class: 'bg-amber-500/10 text-amber-700 ring-amber-500/30 dark:text-amber-300' },
  ready: { label: 'Ready', class: 'bg-brand-500/10 text-brand-700 ring-brand-500/30 dark:text-brand-300' },
}
const badge = computed(() => badges[status.value])
</script>
