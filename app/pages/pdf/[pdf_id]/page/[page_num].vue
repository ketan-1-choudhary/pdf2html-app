<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <NuxtLink to="/" class="back-link">← Drafts</NuxtLink>
      <h1>PDF → HTML Converter</h1>
      <span class="page-tag">Page {{ pageNum }}</span>
    </header>

    <section class="upload-section">
      <div class="upload-row">
        <div class="upload-slot" :class="{ 'upload-slot--active': htmlFile }">
          <input ref="htmlInput" type="file" accept=".html,.htm" class="file-input" @change="onHtmlFileChange" />
          <button class="upload-slot__btn" @click="htmlInput?.click()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span class="upload-slot__label">{{ htmlFile ? htmlFile.name : 'Upload HTML' }}</span>
          </button>
        </div>

        <div class="upload-divider" />

        <!-- CSS -->
        <div class="upload-slot" :class="{ 'upload-slot--active': cssFile }">
          <input ref="cssInput" type="file" accept=".css" class="file-input" @change="onCssFileChange" />
          <button class="upload-slot__btn" @click="cssInput?.click()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 8h10M7 12h6M7 16h8" />
            </svg>
            <span class="upload-slot__label">{{ cssFile ? cssFile.name : 'Upload CSS' }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Editor + Preview -->
    <section ref="workspaceRef" class="workspace">
      <div class="pane pane--editor">
        <div class="pane__toolbar">
          <div class="tabs">
            <button class="tab" :class="{ 'tab--active': activeTab === 'html' }" @click="activeTab = 'html'">HTML</button>
            <button class="tab" :class="{ 'tab--active': activeTab === 'css' }" @click="activeTab = 'css'">CSS</button>
          </div>
          <div class="toolbar-actions">
            <button class="btn btn--outline btn--sm" @click="formatHtml">Format</button>
            <button class="btn btn--primary btn--sm" @click="saveHtml" :disabled="isSaving">
              {{ isSaving ? 'Saving…' : (saveStatus === 'done' ? '✓ Saved' : 'Save HTML') }}
            </button>
            <span v-if="draftStatusLabel" class="saved-label">{{ draftStatusLabel }}</span>
            <span v-if="savedFilename" class="saved-label">{{ savedFilename }}</span>
          </div>
        </div>
        <div class="editor-wrap">
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
              <textarea v-if="activeTab === 'html'" v-model="htmlContent" class="fallback-textarea" spellcheck="false" />
              <textarea v-else v-model="cssContent" class="fallback-textarea" spellcheck="false" />
            </template>
          </ClientOnly>
        </div>
      </div>

      <div class="divider" @mousedown="startResize" />

      <div class="pane pane--preview" :style="{ width: previewWidth + 'px' }">
        <div class="pane__toolbar">
          <span class="pane__title">Preview</span>
          <div class="toolbar-actions">
            <button class="btn btn--outline btn--sm" @click="refreshPreview">↻ Refresh</button>
            <label class="toggle-label">
              <input type="checkbox" v-model="livePreview" />
              Live
            </label>
          </div>
        </div>
        <iframe
          ref="previewFrame"
          class="preview-frame"
          :class="{ 'preview-frame--resizing': isResizing }"
          sandbox="allow-scripts allow-same-origin"
        />
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

// ── Route (draft identity) ────────────────────────────────────────────────────
const route = useRoute()
const pdfId = computed(() => String(route.params.pdf_id))
const pageNum = computed(() => Number(route.params.page_num) || 1)

// ── Editor ──────────────────────────────────────────────────────────────────
const htmlContent = ref('')

const htmlExtensions = [
  html(),
  oneDark,
  EditorView.lineWrapping,
]
const cssExtensions = [
  cssLang(),
  oneDark,
  EditorView.lineWrapping,
]

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

// ── HTML / CSS Upload ────────────────────────────────────────────────────────
const htmlInput = ref<HTMLInputElement | null>(null)
const htmlFile = ref<File | null>(null)
const cssInput = ref<HTMLInputElement | null>(null)
const cssFile = ref<File | null>(null)

async function onHtmlFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  htmlFile.value = file
  htmlContent.value = await file.text()
  refreshPreview()
}

async function onCssFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  cssFile.value = file
  cssContent.value = await file.text()
  refreshPreview()
}

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

// Guards the restore path so loading a draft doesn't re-trigger a save.
let suppressDraft = false

async function restoreDraft() {
  suppressDraft = true
  try {
    const data = await draftSync.load()
    if (data) {
      htmlContent.value = data.html ?? ''
      cssContent.value = data.css ?? ''
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

// ── Format HTML ──────────────────────────────────────────────────────────────
function formatHtml() {
  try {
    htmlContent.value = htmlContent.value.replace(/\n{3,}/g, '\n\n').trim()
  } catch {
    // ignore
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
</script>

<style scoped>
* { box-sizing: border-box; }

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 1.2rem;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
  flex-shrink: 0;
}
.header h1 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #e94560;
  letter-spacing: 0.03em;
}
.back-link {
  color: #aaa;
  text-decoration: none;
  font-size: 0.82rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid #0f3460;
  border-radius: 5px;
  transition: border-color 0.15s, color 0.15s;
}
.back-link:hover { border-color: #aaa; color: #fff; }
.page-tag {
  margin-left: auto;
  font-size: 0.75rem;
  color: #888;
}

/* Upload */
.upload-section {
  padding: 0.4rem 1rem;
  flex-shrink: 0;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
  row-gap: 0.3rem;
}

.file-input { display: none; }

.upload-slot {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.2rem 0.5rem;
}
.upload-slot--active .upload-slot__btn { color: #e0e0e0; border-color: #e94560; }

.upload-slot__btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid #0f3460;
  border-radius: 5px;
  color: #888;
  font-size: 0.78rem;
  padding: 0.22rem 0.55rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  max-width: 220px;
}
.upload-slot__btn:hover { border-color: #aaa; color: #fff; }

.upload-slot__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

.upload-divider {
  width: 1px;
  height: 24px;
  background: #0f3460;
  margin: 0 0.2rem;
  flex-shrink: 0;
}

.file-size { color: #888; font-size: 0.72rem; white-space: nowrap; }

.error-msg {
  margin: 0.3rem 0 0;
  font-size: 0.8rem;
  color: #e94560;
}

/* Workspace split */
.workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
.pane--editor { flex: 1; }
.pane--preview { flex-shrink: 0; background: #fff; }

.pane__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.75rem;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
  flex-shrink: 0;
}
.pane__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
}
.tabs {
  display: flex;
  gap: 0.25rem;
}
.tab {
  background: transparent;
  border: none;
  color: #888;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.tab:hover { color: #fff; }
.tab--active { color: #fff; background: #0f3460; }
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.editor-wrap {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-wrap :deep(.cm-editor) {
  height: 100%;
  font-size: 13px;
}
.editor-wrap :deep(.cm-scroller) {
  overflow: auto;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
}

.fallback-textarea {
  flex: 1;
  width: 100%;
  height: 100%;
  background: #282c34;
  color: #abb2bf;
  border: none;
  padding: 1rem;
  font-family: monospace;
  font-size: 13px;
  resize: none;
  outline: none;
}

.preview-frame {
  flex: 1;
  width: 100%;
  border: none;
  background: #fff;
}
.preview-frame--resizing { pointer-events: none; }

/* Divider */
.divider {
  width: 5px;
  background: #0f3460;
  cursor: col-resize;
  flex-shrink: 0;
  transition: background 0.15s;
}
.divider:hover { background: #e94560; }

/* Buttons */
.btn {
  padding: 0.25rem 0.7rem;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--primary { background: #e94560; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #c73652; }
.btn--outline { background: transparent; color: #aaa; border: 1px solid #0f3460; }
.btn--outline:hover:not(:disabled) { border-color: #aaa; color: #fff; }
.btn--sm { padding: 0.2rem 0.5rem; font-size: 0.75rem; }

.saved-label {
  font-size: 0.72rem;
  color: #888;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Toggle */
.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #aaa;
  cursor: pointer;
  user-select: none;
}
</style>
