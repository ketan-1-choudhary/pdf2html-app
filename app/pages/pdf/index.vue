<template>
  <div class="min-h-screen">
    <!-- Top bar -->
    <header class="sticky top-0 z-30 border-b border-line/70 bg-bg/75 backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5">
        <AppLogo to="/pdf" />

        <label class="relative ml-4 hidden max-w-sm flex-1 md:block">
          <span class="sr-only">Search documents</span>
          <svg class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input v-model="query" type="search" placeholder="Search documents…" class="input py-2 pl-9" />
        </label>

        <div class="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <div class="relative">
            <button
              type="button"
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface py-1 pr-2.5 pl-1 text-sm transition hover:border-brand-500/60"
              :aria-expanded="menuOpen"
              @click="menuOpen = !menuOpen"
            >
              <span class="grid size-7 place-items-center rounded-md bg-linear-to-br from-brand-400 to-brand-700 text-xs font-bold text-white uppercase">
                {{ user?.[0] ?? '?' }}
              </span>
              <span class="hidden max-w-[120px] truncate sm:inline">{{ user }}</span>
              <svg class="size-3.5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6" /></svg>
            </button>

            <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-1 scale-95"
              leave-active-class="transition duration-100 ease-in"
              leave-to-class="opacity-0 -translate-y-1 scale-95"
            >
              <div v-if="menuOpen" class="card absolute right-0 z-50 mt-2 w-52 origin-top-right p-1.5 shadow-xl shadow-zinc-900/10 dark:shadow-black/40">
                <p class="truncate px-2.5 py-2 text-xs text-muted">Signed in as <span class="font-medium text-fg">{{ user }}</span></p>
                <button
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-fg transition hover:bg-surface-2 disabled:opacity-50"
                  :disabled="isLoggingOut"
                  @click="logout"
                >
                  <svg class="size-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                  {{ isLoggingOut ? 'Logging out…' : 'Log out' }}
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-5 py-10">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Your documents</h1>
          <p class="mt-1 text-sm text-muted">
            {{ drafts.length }} {{ drafts.length === 1 ? 'document' : 'documents' }}
            <template v-if="readyCount"> · {{ readyCount }} ready</template>
          </p>
        </div>
        <label class="relative w-full md:hidden">
          <span class="sr-only">Search documents</span>
          <input v-model="query" type="search" placeholder="Search documents…" class="input" />
        </label>
      </div>

      <UploadDropzone class="mt-8" @uploaded="refresh" />

      <p v-if="listError" class="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
        {{ listError }}
      </p>

      <!-- Loading -->
      <ul v-if="pending && !data" class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <li v-for="n in 8" :key="n" class="card overflow-hidden">
          <div class="aspect-[4/3] animate-pulse bg-surface-2" />
          <div class="space-y-3 p-4">
            <div class="h-3 w-2/3 animate-pulse rounded bg-surface-2" />
            <div class="h-1.5 w-full animate-pulse rounded bg-surface-2" />
          </div>
        </li>
      </ul>

      <!-- Empty -->
      <div v-else-if="drafts.length === 0" class="mt-16 flex flex-col items-center text-center">
        <div class="relative">
          <div class="absolute inset-0 -z-10 rounded-full bg-brand-400/20 blur-2xl" />
          <svg class="size-32" viewBox="0 0 120 120" fill="none">
            <rect x="34" y="18" width="52" height="68" rx="6" class="fill-surface stroke-line" stroke-width="2" transform="rotate(-8 60 52)" />
            <rect x="34" y="22" width="52" height="68" rx="6" class="fill-surface stroke-brand-500" stroke-width="2" />
            <rect x="42" y="32" width="26" height="5" rx="2" class="fill-brand-500" />
            <rect x="42" y="44" width="36" height="3" rx="1.5" class="fill-line" />
            <rect x="42" y="51" width="30" height="3" rx="1.5" class="fill-line" />
            <rect x="42" y="58" width="34" height="3" rx="1.5" class="fill-line" />
            <circle cx="84" cy="88" r="14" class="fill-brand-500" />
            <path d="M84 82v12M78 88h12" stroke="white" stroke-width="2.5" stroke-linecap="round" />
          </svg>
        </div>
        <h2 class="mt-6 text-lg font-semibold">No documents yet</h2>
        <p class="mt-1 max-w-sm text-sm text-muted">Drop a PDF above and Reflow will start rebuilding its pages as HTML.</p>
      </div>

      <!-- No search results -->
      <div v-else-if="filtered.length === 0" class="mt-16 text-center">
        <p class="font-medium">No documents match “{{ query }}”</p>
        <button type="button" class="mt-2 cursor-pointer text-sm text-brand-600 hover:underline dark:text-brand-300" @click="query = ''">Clear search</button>
      </div>

      <!-- Grid -->
      <TransitionGroup
        v-else
        tag="ul"
        class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
      >
        <li v-for="pdf in filtered" :key="pdf.pdf_id">
          <PdfTile :pdf="pdf" class="h-full" />
        </li>
      </TransitionGroup>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { PdfSummary } from '~/components/PdfTile.vue'

const listError = ref('')

const { data, pending, refresh } = await useFetch<{ drafts: PdfSummary[] }>('/api/pdf', {
  onResponseError() {
    listError.value = 'Unable to load your documents right now.'
  },
})

const drafts = computed(() => data.value?.drafts ?? [])
const readyCount = computed(() => drafts.value.filter(d => d.total_pages > 0 && d.completed_pages >= d.total_pages).length)

const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? drafts.value.filter(d => d.pdf_name.toLowerCase().includes(q)) : drafts.value
})

const user = useCurrentUser()
const menuOpen = ref(false)
const isLoggingOut = ref(false)

async function logout() {
  isLoggingOut.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/')
  } catch (err: any) {
    console.error('[logout] failed:', err)
    listError.value = 'Unable to log out right now.'
  } finally {
    isLoggingOut.value = false
    menuOpen.value = false
  }
}

useHead({ title: 'Your documents · Reflow' })
</script>
