<template>
  <div class="flex h-screen flex-col overflow-hidden bg-bg text-fg">
    <!-- Header -->
    <header class="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
      <NuxtLink
        to="/pdf"
        class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-fg"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        Documents
      </NuxtLink>
      <span class="h-5 w-px bg-line" />
      <AppLogo to="/pdf" class="hidden sm:inline-flex" />
      <span class="rounded-md bg-brand-500/10 px-2 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-500/25 dark:text-brand-300">
        Page {{ pageNum }}
      </span>

      <div class="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>

    <!-- Editor + Preview -->
    <section ref="workspaceRef" class="flex flex-1 overflow-hidden">
      <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div class="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-3">
          <div class="flex rounded-lg bg-surface-2 p-0.5">
            <button
              v-for="tab in (['html', 'css'] as const)"
              :key="tab"
              type="button"
              class="cursor-pointer rounded-md px-3 py-1 text-xs font-semibold tracking-wide uppercase transition"
              :class="activeTab === tab ? 'bg-surface text-brand-700 shadow-sm dark:text-brand-300' : 'text-muted hover:text-fg'"
              @click="activeTab = tab"
            >
              {{ tab }}
            </button>
          </div>
          <div class="flex min-w-0 items-center gap-2">
            <span v-if="draftStatusLabel" class="inline-flex items-center gap-1.5 text-xs text-muted">
              <span class="size-1.5 rounded-full" :class="draftDotClass" />
              {{ draftStatusLabel }}
            </span>
            <span v-if="savedFilename" class="max-w-[140px] truncate text-xs text-muted">{{ savedFilename }}</span>
            <button type="button" class="btn btn-ghost btn-sm" :disabled="isFormatting" :title="`Format ${activeTab.toUpperCase()}`" @click="formatActive">
              {{ isFormatting ? 'Formatting…' : 'Format' }}
            </button>
            <button type="button" class="btn btn-primary btn-sm" :disabled="isSaving" @click="saveHtml">
              {{ isSaving ? 'Saving…' : (saveStatus === 'done' ? '✓ Saved' : 'Save HTML') }}
            </button>
          </div>
        </div>
        <div class="editor-wrap flex flex-1 flex-col overflow-hidden">
          <ClientOnly>
            <codemirror
              v-if="activeTab === 'html'"
              v-model="htmlContent"
              :extensions="htmlExtensions"
              :style="{ height: '100%', width: '100%' }"
              :autofocus="true"
              @change="onEditorChange"
            />
            <codemirror
              v-else
              v-model="cssContent"
              :extensions="cssExtensions"
              :style="{ height: '100%', width: '100%' }"
              :autofocus="true"
              @change="onEditorChange"
            />
            <template #fallback>
              <textarea
                v-if="activeTab === 'html'"
                v-model="htmlContent"
                class="size-full flex-1 resize-none bg-surface p-4 font-mono text-[13px] outline-none"
                spellcheck="false"
              />
              <textarea
                v-else
                v-model="cssContent"
                class="size-full flex-1 resize-none bg-surface p-4 font-mono text-[13px] outline-none"
                spellcheck="false"
              />
            </template>
          </ClientOnly>
        </div>
      </div>

      <div
        class="group relative w-1.5 shrink-0 cursor-col-resize bg-line transition hover:bg-brand-500"
        :class="{ 'bg-brand-500': isResizing }"
        @mousedown="startResize"
      >
        <span class="absolute top-1/2 left-1/2 h-8 w-0.5 -translate-1/2 rounded-full bg-muted/50 group-hover:bg-white/80" />
      </div>

      <div class="flex shrink-0 flex-col overflow-hidden" :style="{ width: previewWidth + 'px' }">
        <div class="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-3">
          <div class="flex items-center gap-1">
            <div class="flex rounded-lg bg-surface-2 p-0.5" role="radiogroup" aria-label="Viewport size">
              <button
                v-for="(preset, key) in viewportPresets"
                :key="key"
                type="button"
                role="radio"
                :aria-checked="activePreset === key"
                :title="preset.width ? `${preset.label} · ${preset.width} × ${preset.height}` : preset.label"
                class="grid size-7 cursor-pointer place-items-center rounded-md transition"
                :class="activePreset === key ? 'bg-surface text-brand-700 shadow-sm dark:text-brand-300' : 'text-muted hover:text-fg'"
                @click="activePreset = key"
              >
                <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path :d="preset.icon" /></svg>
              </button>
            </div>
            <button
              type="button"
              title="Rotate"
              class="grid size-7 cursor-pointer place-items-center rounded-md text-muted transition hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
              :class="{ 'text-brand-600 dark:text-brand-300': isLandscape }"
              :disabled="!viewportPresets[activePreset].rotatable"
              @click="isLandscape = !isLandscape"
            >
              <svg class="size-4 transition" :class="{ 'rotate-90': isLandscape }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" /></svg>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="btn btn-ghost btn-sm" title="Refresh preview" @click="refreshPreview">↻</button>
            <label class="inline-flex cursor-pointer items-center gap-2 text-xs text-muted select-none">
              <input v-model="livePreview" type="checkbox" class="peer sr-only" />
              <span class="relative h-4 w-7 rounded-full bg-surface-2 ring-1 ring-line transition peer-checked:bg-brand-500 peer-checked:ring-brand-500 after:absolute after:top-0.5 after:left-0.5 after:size-3 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-3" />
              Live
            </label>
          </div>
        </div>
        <div ref="stageRef" class="relative flex-1 overflow-hidden bg-surface-2 p-3 pb-9">
          <div class="mx-auto overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-line" :style="frameBoxStyle">
            <iframe
              ref="previewFrame"
              class="block border-0 bg-white"
              :class="{ 'pointer-events-none': isResizing }"
              :style="iframeStyle"
              sandbox="allow-same-origin"
            />
          </div>
          <span class="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-surface px-2.5 py-0.5 font-mono text-[11px] whitespace-nowrap text-muted ring-1 ring-line">
            {{ viewportLabel }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { html } from '@codemirror/lang-html'
import { css as cssLang } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { Prec } from '@codemirror/state'

// ── Route (draft identity) ────────────────────────────────────────────────────
const route = useRoute()
const pdfId = computed(() => String(route.params.pdf_id))
const pageNum = computed(() => Number(route.params.page_num) || 1)

// ── Editor ──────────────────────────────────────────────────────────────────
const htmlContent = ref('')
const { isDark } = useTheme()

const sharedEditorTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px', backgroundColor: 'var(--surface)' },
  '.cm-scroller': { fontFamily: '"JetBrains Mono", "Cascadia Code", Consolas, monospace' },
  '.cm-gutters': { backgroundColor: 'var(--surface)', color: 'var(--muted)', border: 'none' },
  '&.cm-focused': { outline: 'none' },
})

const lightEditorTheme = EditorView.theme({
  '&': { color: 'var(--text)' },
  '.cm-content': { caretColor: '#0d9488' },
  '&.cm-focused .cm-cursor': { borderLeftColor: '#0d9488' },
  '.cm-activeLine': { backgroundColor: 'rgb(20 184 166 / .06)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgb(20 184 166 / .1)', color: '#0f766e' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'rgb(20 184 166 / .2)' },
})

const themeExtensions = computed(() => isDark.value
  ? [oneDark, Prec.highest(sharedEditorTheme)]
  : [lightEditorTheme, Prec.highest(sharedEditorTheme)])

const htmlExtensions = computed(() => [html(), EditorView.lineWrapping, ...themeExtensions.value])
const cssExtensions = computed(() => [cssLang(), EditorView.lineWrapping, ...themeExtensions.value])

const activeTab = ref<'html' | 'css'>('html')
const livePreview = ref(true)

function onEditorChange() {
  if (livePreview.value) refreshPreview()
}

// ── Preview ──────────────────────────────────────────────────────────────────
const previewFrame = ref<HTMLIFrameElement | null>(null)
const cssContent = ref('')

// Embeds the draft CSS as a <style> tag so it applies without needing a <link>.
function composeHtml(htmlText: string, cssText: string) {
  if (!cssText.trim()) return htmlText
  const styleTag = `<style>\n${cssText}\n</style>`
  if (/<\/head>/i.test(htmlText)) return htmlText.replace(/<\/head>/i, `${styleTag}\n</head>`)
  if (/<body[^>]*>/i.test(htmlText)) return htmlText.replace(/(<body[^>]*>)/i, `$1\n${styleTag}`)
  return `${styleTag}\n${htmlText}`
}

function refreshPreview() {
  const frame = previewFrame.value
  if (!frame) return
  const doc = frame.contentDocument || frame.contentWindow?.document
  if (!doc) return
  doc.open()
  doc.write(composeHtml(htmlContent.value, cssContent.value))
  doc.close()
}

watch([htmlContent, cssContent], () => {
  if (livePreview.value) refreshPreview()
})

// ── Viewport presets ───────────────────────────────────────────────────────────────
const viewportPresets = {
  fit: { label: 'Fit to pane', width: 0, height: 0, rotatable: false, icon: 'M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4' },
  mobile: { label: 'Mobile', width: 390, height: 844, rotatable: true, icon: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2' },
  tablet: { label: 'Tablet', width: 768, height: 1024, rotatable: true, icon: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2' },
  laptop: { label: 'Laptop', width: 1366, height: 768, rotatable: false, icon: 'M4 5h16v11H4zM2 19h20' },
  desktop: { label: 'Desktop', width: 1920, height: 1080, rotatable: false, icon: 'M3 4h18v12H3zM8 20h8M12 16v4' },
}
type PresetKey = keyof typeof viewportPresets

const activePreset = ref<PresetKey>('fit')
const isLandscape = ref(false)
const stageRef = ref<HTMLElement | null>(null)
const stageSize = ref({ width: 0, height: 0 })
let stageObserver: ResizeObserver | null = null

const frameSize = computed(() => {
  const p = viewportPresets[activePreset.value]
  if (!p.width) return null
  return p.rotatable && isLandscape.value
    ? { width: p.height, height: p.width }
    : { width: p.width, height: p.height }
})

// Render at the real device size, then scale down so the whole screen fits the pane.
const frameScale = computed(() => {
  const f = frameSize.value
  const s = stageSize.value
  if (!f || !s.width || !s.height) return 1
  return Math.min(1, s.width / f.width, s.height / f.height)
})

const frameBoxStyle = computed(() => {
  const f = frameSize.value
  if (!f) return { width: '100%', height: '100%' }
  return { width: `${f.width * frameScale.value}px`, height: `${f.height * frameScale.value}px` }
})

const iframeStyle = computed(() => {
  const f = frameSize.value
  if (!f) return { width: '100%', height: '100%' }
  return {
    width: `${f.width}px`,
    height: `${f.height}px`,
    transform: `scale(${frameScale.value})`,
    transformOrigin: 'top left',
  }
})

const viewportLabel = computed(() => {
  const f = frameSize.value
  if (!f) return `${Math.round(stageSize.value.width)} × ${Math.round(stageSize.value.height)}`
  return `${f.width} × ${f.height} · ${Math.round(frameScale.value * 100)}%`
})

watch(activePreset, () => { isLandscape.value = false })

onMounted(() => {
  if (!stageRef.value) return
  stageObserver = new ResizeObserver(([entry]) => {
    if (!entry) return
    stageSize.value = { width: entry.contentRect.width, height: entry.contentRect.height }
  })
  stageObserver.observe(stageRef.value)
})

onUnmounted(() => stageObserver?.disconnect())

// ── Draft autosave (IndexedDB → DynamoDB) ─────────────────────────────────────
const draftSync = useDraftSync({
  pdfId: () => pdfId.value,
  pageNum: () => pageNum.value,
  html: () => htmlContent.value,
  css: () => cssContent.value,
})

const draftStatusLabel = computed(() => {
  const map: Record<string, string> = { local: 'Saving…', saving: 'Saving…', saved: 'Saved', error: 'Offline' }
  return map[draftSync.status.value] ?? ''
})

const draftDotClass = computed(() => {
  const map: Record<string, string> = { local: 'bg-amber-400 animate-pulse', saving: 'bg-amber-400 animate-pulse', saved: 'bg-brand-500', error: 'bg-red-500' }
  return map[draftSync.status.value] ?? 'bg-muted'
})

// Guards the restore path so loading a draft doesn't re-trigger a save.
let suppressDraft = false

async function restoreDraft() {
  suppressDraft = true
  try {
    const data = await draftSync.load()
    if (data) {
      const html = data.html ?? ''
      const css = data.css ?? ''
      // Never block loading the draft on a formatter failure.
      const [nextHtml, nextCss] = await Promise.all([
        looksMinified(html) ? formatHtmlCode(html).catch(() => html) : html,
        looksMinified(css) ? formatCssCode(css).catch(() => css) : css,
      ])
      htmlContent.value = nextHtml
      cssContent.value = nextCss
    }
  } finally {
    await nextTick()
    suppressDraft = false
    refreshPreview()
  }
}

watch([htmlContent, cssContent], () => {
  if (!suppressDraft) draftSync.onChange()
})

// Reload content whenever the routed page changes.
watch([pdfId, pageNum], () => {
  if (!suppressDraft) restoreDraft()
})

onMounted(() => {
  draftSync.start()
  restoreDraft()
})

onUnmounted(() => draftSync.stop())

// ── HTML Save ────────────────────────────────────────────────────────────────
const isSaving = ref(false)
const saveStatus = ref<'idle' | 'done'>('idle')
const savedFilename = ref('')

async function saveHtml() {
  isSaving.value = true
  saveStatus.value = 'idle'
  try {
    const res = await $fetch<{ filename: string }>('/api/save-html', {
      method: 'POST',
      body: { filename: `${pdfId.value}.html`, content: composeHtml(htmlContent.value, cssContent.value) },
    })
    savedFilename.value = res.filename
    saveStatus.value = 'done'
  } catch (err: any) {
    console.error('[saveHtml] failed:', err)
    alert(err?.data?.statusMessage ?? 'Save failed.')
  } finally {
    isSaving.value = false
  }
}

// ── Format ────────────────────────────────────────────────────────────────────────────
const isFormatting = ref(false)

async function formatActive() {
  isFormatting.value = true
  try {
    if (activeTab.value === 'html') htmlContent.value = await formatHtmlCode(htmlContent.value)
    else cssContent.value = await formatCssCode(cssContent.value)
  } catch (err) {
    console.error('[formatActive] failed:', err)
  } finally {
    isFormatting.value = false
  }
}

// ── Resizable Divider ────────────────────────────────────────────────────────
const previewWidth = ref(480)
const workspaceRef = ref<HTMLElement | null>(null)
const isResizing = ref(false)
let resizing = false
let startX = 0
let startWidth = 0

function startResize(e: MouseEvent) {
  resizing = true
  isResizing.value = true
  startX = e.clientX
  startWidth = previewWidth.value
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
}

function doResize(e: MouseEvent) {
  if (!resizing) return
  const workspaceWidth = workspaceRef.value?.clientWidth ?? window.innerWidth
  const minPreview = 240
  const minEditor = 320
  const maxPreview = Math.max(minPreview, workspaceWidth - minEditor)
  const dragDelta = e.clientX - startX
  // Divider is to the left of preview pane, so moving right reduces preview width.
  const nextWidth = startWidth - dragDelta
  previewWidth.value = Math.max(minPreview, Math.min(nextWidth, maxPreview))
}

function stopResize() {
  resizing = false
  isResizing.value = false
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
})

useHead({ title: () => `Page ${pageNum.value} · Reflow` })
</script>

<style scoped>
.editor-wrap :deep(.cm-editor) { height: 100%; }
.editor-wrap :deep(.cm-scroller) { overflow: auto; }
</style>
