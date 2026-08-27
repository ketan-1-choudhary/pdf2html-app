// Draft sync orchestration: save locally on every change, push to DynamoDB after
// an idle gap (or on demand), delete the local row on success, and flush any
// leftover local drafts when connectivity returns. Latest write overwrites.

interface DraftSyncOptions {
  pdfId: () => string
  pageNum: () => number | string
  html: () => string
  css: () => string
  pdfName?: () => string
  idleMs?: number
}

export type DraftStatus = 'idle' | 'local' | 'saving' | 'saved' | 'error'

// Local IndexedDB key is composite so each page keeps its own outbox row.
function localKey(pdfId: string, pageNum: number | string) {
  return `${pdfId}#${pageNum}`
}

function pageEndpoint(pdfId: string, pageNum: number | string) {
  return `/api/pdf/${encodeURIComponent(pdfId)}/page/${encodeURIComponent(String(pageNum))}`
}

export function useDraftSync(opts: DraftSyncOptions) {
  const { saveDraft, getDraft, deleteDraft, getAllDrafts } = useDraftDb()
  const status = ref<DraftStatus>('idle')
  const idleMs = opts.idleMs ?? 4000
  let idleTimer: ReturnType<typeof setTimeout> | null = null

  async function saveLocal() {
    const id = opts.pdfId()
    if (!id) return
    await saveDraft(localKey(id, opts.pageNum()), opts.html(), opts.css())
    status.value = 'local'
  }

  async function flushNow() {
    const id = opts.pdfId()
    if (!id) return
    const key = localKey(id, opts.pageNum())
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null }
    status.value = 'saving'
    try {
      await $fetch(pageEndpoint(id, opts.pageNum()), {
        method: 'PUT',
        body: { html: opts.html(), css: opts.css(), pdf_name: opts.pdfName?.() },
      })
      await deleteDraft(key) // clear local outbox row on successful push
      status.value = 'saved'
    } catch {
      status.value = 'error' // keep local copy for retry
    }
  }

  // Call on every content change: persist locally now, schedule a server push.
  function onChange() {
    void saveLocal()
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(() => void flushNow(), idleMs)
  }

  // Push every leftover local draft (e.g. after reconnecting), clearing each.
  async function flushAllPending() {
    const drafts = await getAllDrafts()
    for (const d of drafts) {
      // pageId here is the composite `${pdfId}#${pageNum}` local key.
      const sep = d.pageId.lastIndexOf('#')
      if (sep < 0) continue
      const pdfId = d.pageId.slice(0, sep)
      const pageNum = d.pageId.slice(sep + 1)
      try {
        await $fetch(pageEndpoint(pdfId, pageNum), {
          method: 'PUT',
          body: { html: d.html, css: d.css },
        })
        await deleteDraft(d.pageId)
      } catch {
        // leave it for the next reconnect attempt
      }
    }
  }

  // Load a page: a local unsynced row wins over the server (it's newer work).
  async function load(): Promise<{ html: string; css: string } | null> {
    const id = opts.pdfId()
    if (!id) return null
    const local = await getDraft(localKey(id, opts.pageNum()))
    if (local) return { html: local.html, css: local.css }
    try {
      const res = await $fetch<{ html: string; css: string }>(pageEndpoint(id, opts.pageNum()))
      return { html: res.html, css: res.css }
    } catch {
      return null
    }
  }

  function start() {
    if (!import.meta.client) return
    window.addEventListener('online', flushAllPending)
    window.addEventListener('beforeunload', () => void flushNow())
  }

  function stop() {
    if (idleTimer) clearTimeout(idleTimer)
    if (!import.meta.client) return
    window.removeEventListener('online', flushAllPending)
  }

  return { status, onChange, flushNow, flushAllPending, load, start, stop }
}
