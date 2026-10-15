// Fetches a zip export and hands it to the browser as a file download, surfacing server errors.
export function useZipDownload() {
  const isDownloading = ref(false)
  const error = ref('')

  async function download(url: string) {
    isDownloading.value = true
    error.value = ''
    try {
      const res = await fetch(url, { credentials: 'same-origin' })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.statusMessage || body?.message || 'Export failed.')
      }
      const filename = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'export.zip'
      const href = URL.createObjectURL(await res.blob())
      const link = document.createElement('a')
      link.href = href
      link.download = filename
      link.click()
      setTimeout(() => URL.revokeObjectURL(href), 0)
    } catch (err: any) {
      console.error('[useZipDownload] failed:', err)
      error.value = err?.message ?? 'Export failed.'
    } finally {
      isDownloading.value = false
    }
  }

  return { download, isDownloading, error }
}
