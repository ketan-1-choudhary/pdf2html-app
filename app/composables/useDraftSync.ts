// Draft sync orchestration: save locally on every change, push to Mongo after
// an idle gap (or on demand), delete the local row on success, and flush any
// leftover local drafts when connectivity returns. Latest write overwrites.

interface DraftSyncOptions {
  pageId: () => string
  html: () => string
  css: () => string
  pdfName?: () => string
  idleMs?: number
}

export type DraftStatus = 'idle' | 'local' | 'saving' | 'saved' | 'error'

export function useDraftSync(opts: DraftSyncOptions) {
  const { saveDraft, getDraft, deleteDraft, getAllDrafts } = useDraftDb()
  const status = ref<DraftStatus>('idle')
  const idleMs = opts.idleMs ?? 4000
  let idleTimer: ReturnType<typeof setTimeout> | null = null

  async function saveLocal() {
    const id = opts.pageId()
    if (!id) return
    await saveDraft(id, opts.html(), opts.css())
    status.value = 'local'
  }

  async function flushNow() {
    const id = opts.pageId()
    if (!id) return
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null }
    status.value = 'saving'
    try {
      await $fetch(`/api/drafts/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: { html: opts.html(), css: opts.css(), pdfName: opts.pdfName?.() ?? id },
      })
      await deleteDraft(id) // clear local outbox row on successful push
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
      try {
        await $fetch(`/api/drafts/${encodeURIComponent(d.pageId)}`, {
          method: 'PUT',
          body: { html: d.html, css: d.css, pdfName: d.pageId },
        })
        await deleteDraft(d.pageId)
      } catch {
        // leave it for the next reconnect attempt
      }
    }
  }

  // Load a page: a local unsynced row wins over the server (it's newer work).
  async function load(): Promise<{ html: string; css: string } | null> {
    const id = opts.pageId()
    if (!id) return null
    const local = await getDraft(id)
    if (local) return { html: local.html, css: local.css }
    try {
      const res = await $fetch<{ html: string; css: string }>(`/api/drafts/${encodeURIComponent(id)}`)
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
