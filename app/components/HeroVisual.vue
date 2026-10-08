<template>
  <div class="card relative overflow-hidden p-2 shadow-2xl shadow-brand-900/10 dark:shadow-black/40">
    <div class="flex items-center gap-2 border-b border-line px-3 py-2.5">
      <span class="size-2.5 rounded-full bg-red-400/80" />
      <span class="size-2.5 rounded-full bg-amber-400/80" />
      <span class="size-2.5 rounded-full bg-emerald-400/80" />
      <span class="mx-auto rounded-md bg-surface-2 px-3 py-0.5 font-mono text-[11px] text-muted">
        reflow.app/pdf/annual-report/page/1
      </span>
    </div>

    <div class="grid items-stretch gap-3 p-3 md:grid-cols-[1fr_auto_1.15fr_auto_1fr] md:gap-2">
      <!-- Source PDF -->
      <figure class="flex flex-col gap-2">
        <figcaption class="panel-label">source.pdf</figcaption>
        <div class="relative flex-1 overflow-hidden rounded-xl bg-surface-2 p-4">
          <div class="relative mx-auto aspect-[3/4] max-w-[220px] rotate-[-1.5deg] rounded-sm bg-white p-4 shadow-lg shadow-zinc-900/15">
            <div class="h-2.5 w-2/3 rounded-sm bg-zinc-800" />
            <div class="mt-1.5 h-1.5 w-1/3 rounded-sm bg-zinc-400" />
            <div class="mt-4 space-y-1.5">
              <div v-for="w in ['w-full', 'w-11/12', 'w-full', 'w-4/5']" :key="w + 'a'" class="h-1 rounded-sm bg-zinc-300" :class="w" />
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <div class="aspect-[4/3] rounded-sm bg-zinc-200" />
              <div class="space-y-1.5">
                <div v-for="w in ['w-full', 'w-5/6', 'w-full', 'w-2/3', 'w-11/12']" :key="w + 'b'" class="h-1 rounded-sm bg-zinc-300" :class="w" />
              </div>
            </div>
            <div class="mt-4 space-y-1.5">
              <div v-for="w in ['w-full', 'w-3/4']" :key="w + 'c'" class="h-1 rounded-sm bg-zinc-300" :class="w" />
            </div>
            <div class="scan-line" />
          </div>
        </div>
      </figure>

      <FlowArrow />

      <!-- Generated code -->
      <figure class="flex flex-col gap-2">
        <figcaption class="panel-label">page.html</figcaption>
        <div class="flex-1 overflow-hidden rounded-xl bg-zinc-900 p-4 font-mono text-[11px] leading-relaxed ring-1 ring-white/5 sm:text-xs">
          <div
            v-for="(line, i) in codeLines"
            :key="i"
            class="code-line whitespace-pre"
            :style="{ animationDelay: `${i * 0.22}s`, paddingLeft: `${line.indent}ch` }"
          >
            <span v-for="(tok, j) in line.tokens" :key="j" :class="tok[1]">{{ tok[0] }}</span>
          </div>
        </div>
      </figure>

      <FlowArrow />

      <!-- Rendered output -->
      <figure class="flex flex-col gap-2">
        <figcaption class="panel-label">Rendered</figcaption>
        <div class="flex-1 overflow-hidden rounded-xl border border-line bg-bg p-3">
          <div class="pop rounded-md bg-linear-to-r from-brand-500 to-brand-700 px-3 py-2.5" style="animation-delay: .4s">
            <div class="h-2 w-1/2 rounded-sm bg-white/90" />
            <div class="mt-1.5 h-1.5 w-1/4 rounded-sm bg-white/60" />
          </div>
          <div class="pop mt-3 space-y-1.5" style="animation-delay: .9s">
            <div class="h-1.5 w-full rounded-sm bg-fg/15" />
            <div class="h-1.5 w-5/6 rounded-sm bg-fg/15" />
            <div class="h-1.5 w-2/3 rounded-sm bg-fg/15" />
          </div>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <div class="pop aspect-[4/3] rounded-md bg-linear-to-br from-brand-200 to-brand-400 dark:from-brand-700 dark:to-brand-900" style="animation-delay: 1.4s" />
            <div class="pop space-y-1.5 rounded-md bg-surface p-2 ring-1 ring-line" style="animation-delay: 1.8s">
              <div class="h-1.5 w-3/4 rounded-sm bg-brand-500/70" />
              <div class="h-1 w-full rounded-sm bg-fg/15" />
              <div class="h-1 w-5/6 rounded-sm bg-fg/15" />
              <div class="h-1 w-2/3 rounded-sm bg-fg/15" />
            </div>
          </div>
          <div class="pop mt-3 flex gap-2" style="animation-delay: 2.2s">
            <div class="h-5 w-16 rounded-full bg-brand-500/90" />
            <div class="h-5 w-12 rounded-full ring-1 ring-line" />
          </div>
        </div>
      </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
const FlowArrow = defineComponent({
  render: () => h('div', { class: 'grid place-items-center' }, [
    h('div', { class: 'flow-arrow relative grid size-9 rotate-90 place-items-center rounded-full border border-line bg-surface text-brand-600 dark:text-brand-300 md:rotate-0' }, [
      h('svg', { class: 'size-4', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
        h('path', { d: 'M5 12h14M13 6l6 6-6 6' }),
      ]),
    ]),
  ]),
})

const tag = 'text-rose-300'
const attr = 'text-amber-200'
const str = 'text-brand-300'
const txt = 'text-zinc-300'

const codeLines: { indent: number, tokens: [string, string][] }[] = [
  { indent: 0, tokens: [['<section ', tag], ['class', attr], ['=', txt], ['"hero"', str], ['>', tag]] },
  { indent: 2, tokens: [['<h1>', tag], ['Annual Report', txt], ['</h1>', tag]] },
  { indent: 2, tokens: [['<p ', tag], ['class', attr], ['=', txt], ['"lead"', str], ['>', tag], ['Growth…', txt], ['</p>', tag]] },
  { indent: 2, tokens: [['<div ', tag], ['class', attr], ['=', txt], ['"grid-2"', str], ['>', tag]] },
  { indent: 4, tokens: [['<img ', tag], ['src', attr], ['=', txt], ['"chart.png"', str], [' />', tag]] },
  { indent: 4, tokens: [['<article>', tag], ['…', txt], ['</article>', tag]] },
  { indent: 2, tokens: [['</div>', tag]] },
  { indent: 2, tokens: [['<a ', tag], ['class', attr], ['=', txt], ['"btn"', str], ['>', tag], ['Read', txt], ['</a>', tag]] },
  { indent: 0, tokens: [['</section>', tag]] },
  { indent: 0, tokens: [['', txt]] },
  { indent: 0, tokens: [['.hero', str], [' { ', txt], ['display', attr], [': grid; }', txt]] },
]
</script>

<style scoped>
.panel-label {
  font-family: "JetBrains Mono", "Cascadia Code", Consolas, monospace;
  font-size: 11px;
  letter-spacing: .04em;
  color: var(--muted);
  padding-inline: .25rem;
}

.scan-line {
  position: absolute;
  inset-inline: -6%;
  height: 18%;
  background: linear-gradient(to bottom, transparent, rgb(20 184 166 / .28) 70%, rgb(20 184 166 / .9));
  border-bottom: 1.5px solid #14b8a6;
  animation: scan 3.6s cubic-bezier(.45, 0, .55, 1) infinite;
}
@keyframes scan {
  0% { top: -18%; opacity: 0; }
  12% { opacity: 1; }
  88% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.code-line {
  opacity: 0;
  animation: type-in 7s ease-out infinite;
}
@keyframes type-in {
  0% { opacity: 0; transform: translateX(-6px); }
  6%, 82% { opacity: 1; transform: none; }
  92%, 100% { opacity: 0; }
}

.pop {
  opacity: 0;
  animation: pop 7s cubic-bezier(.2, .8, .2, 1) infinite;
}
@keyframes pop {
  0% { opacity: 0; transform: translateY(6px) scale(.97); }
  8%, 80% { opacity: 1; transform: none; }
  90%, 100% { opacity: 0; }
}

:deep(.flow-arrow)::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 9999px;
  border: 1px solid rgb(20 184 166 / .5);
  animation: ping 2.4s ease-out infinite;
}
@keyframes ping {
  0% { transform: scale(.85); opacity: .9; }
  100% { transform: scale(1.35); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .code-line, .pop { animation: none; opacity: 1; }
  .scan-line { display: none; }
}
</style>
