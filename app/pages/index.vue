<template>
  <div class="relative isolate overflow-x-clip">
    <!-- Ambient background -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute -top-40 left-1/2 h-[560px] w-[960px] -translate-x-1/2 rounded-full bg-brand-400/25 blur-3xl dark:bg-brand-500/15" />
      <div class="absolute top-[480px] -right-40 h-[420px] w-[420px] rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-800/20" />
      <div class="grid-bg absolute inset-x-0 top-0 h-[900px]" />
    </div>

    <!-- Nav -->
    <header class="sticky top-0 z-30 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
      <nav class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <AppLogo />
        <div class="ml-6 hidden gap-6 text-sm text-muted md:flex">
          <a href="#how" class="transition hover:text-fg">How it works</a>
          <a href="#features" class="transition hover:text-fg">Features</a>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button type="button" class="btn btn-ghost hidden sm:inline-flex" @click="openAuth('signin')">Sign in</button>
          <button type="button" class="btn btn-primary" @click="openAuth('signup')">Get started</button>
        </div>
      </nav>
    </header>

    <!-- Hero -->
    <section class="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 pb-20 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
      <div>
        <span class="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-70" />
            <span class="relative inline-flex size-2 rounded-full bg-brand-500" />
          </span>
          AI-powered PDF → HTML
        </span>

        <h1 class="mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          PDFs, rebuilt as
          <span class="bg-linear-to-r from-brand-500 via-brand-400 to-brand-700 bg-clip-text text-transparent dark:from-brand-300 dark:via-brand-400 dark:to-brand-500">
            real web pages.
          </span>
        </h1>

        <p class="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted">
          Drop in any PDF — even a scanned one. Reflow reads every page and rebuilds it as clean, responsive HTML and CSS you can actually edit.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <button type="button" class="btn btn-primary px-5 py-3 text-base" @click="openAuth('signup')">
            Start converting
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <a href="#how" class="btn btn-ghost px-5 py-3 text-base">See how it works</a>
        </div>

        <ul class="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <li v-for="item in heroChecks" :key="item" class="flex items-center gap-2">
            <svg class="size-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            {{ item }}
          </li>
        </ul>
      </div>

      <div id="auth" class="scroll-mt-24">
        <AuthCard v-model:mode="authMode" />
      </div>
    </section>

    <!-- Showcase -->
    <section class="mx-auto max-w-6xl px-5 pb-24">
      <HeroVisual />
    </section>

    <!-- How it works -->
    <section id="how" class="scroll-mt-20 border-y border-line/70 bg-surface/60 py-24">
      <div class="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="How it works" title="From PDF to web page in three steps" />

        <ol class="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          <li aria-hidden="true" class="absolute top-7 right-[16%] left-[16%] hidden h-px bg-linear-to-r from-transparent via-brand-500/50 to-transparent md:block" />
          <li v-for="(step, i) in steps" :key="step.title" class="relative text-center">
            <div class="mx-auto grid size-14 place-items-center rounded-2xl border border-line bg-bg text-brand-600 shadow-sm dark:text-brand-300">
              <span class="text-lg font-bold">{{ i + 1 }}</span>
            </div>
            <h3 class="mt-5 text-lg font-semibold">{{ step.title }}</h3>
            <p class="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">{{ step.body }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
      <SectionHeading eyebrow="Features" title="Everything you need to set a PDF free" />

      <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="f in features"
          :key="f.title"
          class="card group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-900/5"
        >
          <div class="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-brand-400/0 blur-2xl transition duration-500 group-hover:bg-brand-400/20" />
          <div class="grid size-11 place-items-center rounded-xl bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/20 dark:text-brand-300">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="d in f.icon" :key="d" :d="d" />
            </svg>
          </div>
          <h3 class="mt-5 font-semibold">{{ f.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ f.body }}</p>
        </article>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-line/70">
      <div class="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <AppLogo />
          <p class="mt-3 max-w-xs text-sm text-muted">PDFs, rebuilt as real web pages.</p>
        </div>
        <div class="flex flex-wrap gap-6 text-sm text-muted">
          <a href="#how" class="hover:text-fg">How it works</a>
          <a href="#features" class="hover:text-fg">Features</a>
          <button type="button" class="cursor-pointer hover:text-fg" @click="openAuth('signin')">Sign in</button>
        </div>
      </div>
      <div class="border-t border-line/70 py-6 text-center text-xs text-muted">
        © {{ year }} Reflow. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const authMode = ref<'signin' | 'signup'>('signin')
const year = new Date().getFullYear()

function openAuth(mode: 'signin' | 'signup') {
  authMode.value = mode
  document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  nextTick(() => document.querySelector<HTMLInputElement>('#auth input')?.focus({ preventScroll: true }))
}

const heroChecks = ['Works on scanned PDFs', 'Pixel-faithful layout', 'Editable HTML & CSS']

const steps = [
  { title: 'Upload your PDF', body: 'Drag in a document of any length. Reflow splits it into pages and queues each one.' },
  { title: 'AI rebuilds each page', body: 'Layout, typography and images are detected and recreated as semantic, responsive markup.' },
  { title: 'Edit & export', body: 'Fine-tune the HTML and CSS side by side with a live preview, then ship it.' },
]

const features = [
  { title: 'Pixel-faithful layout', body: 'Columns, spacing and type are matched against the rendered page — not guessed from text.', icon: ['M4 4h16v16H4z', 'M4 10h16M10 10v10'] },
  { title: 'Scanned PDFs welcome', body: 'Image-only documents go through OCR, so nothing is out of reach.', icon: ['M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2', 'M7 12h10'] },
  { title: 'Page-by-page control', body: 'Every page is its own draft, so you can open, tweak and re-save pages independently.', icon: ['M8 3h9l4 4v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M3 7v13a2 2 0 0 0 2 2h11'] },
  { title: 'Live code editor', body: 'HTML and CSS tabs with syntax highlighting and an instant, resizable preview.', icon: ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6', 'M14 4l-4 16'] },
  { title: 'Responsive by default', body: 'Output reflows gracefully from wide desktops down to phones.', icon: ['M2 5h14v10H2z', 'M18 9h4v11h-4z', 'M6 19h6'] },
  { title: 'Autosave & sync', body: 'Edits are saved locally first and synced to the cloud, so you never lose work.', icon: ['M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 7.9', 'M12 13v8M9 16l3-3 3 3'] },
]

const SectionHeading = defineComponent({
  props: { eyebrow: String, title: String },
  setup: props => () => h('div', { class: 'mx-auto max-w-2xl text-center' }, [
    h('p', { class: 'text-sm font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-300' }, props.eyebrow),
    h('h2', { class: 'mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl' }, props.title),
  ]),
})
</script>

<style scoped>
.grid-bg {
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--text) 6%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--text) 6%, transparent) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 40%, transparent 100%);
}
</style>
