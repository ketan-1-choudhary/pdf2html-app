<template>
  <div
    class="group relative overflow-hidden rounded-2xl border-2 border-dashed transition duration-200"
    :class="isDragging
      ? 'scale-[1.01] border-brand-500 bg-brand-500/10 shadow-[0_0_0_6px_rgb(20_184_166/0.12)]'
      : 'border-line bg-surface/70 hover:border-brand-500/50'"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <input ref="fileInput" type="file" accept="application/pdf,.pdf" class="sr-only" @change="onPick" />

    <div class="flex flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:text-left">
      <div
        class="grid size-14 shrink-0 place-items-center rounded-2xl transition"
        :class="isDragging ? 'bg-brand-500 text-white dark:text-zinc-950' : 'bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/20 dark:text-brand-300'"
      >
        <svg class="size-6 transition" :class="{ '-translate-y-0.5': isDragging }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
      </div>

      <div class="min-w-0 flex-1">
        <template v-if="isUploading">
          <p class="truncate font-medium">Uploading {{ fileName }}</p>
          <div class="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div class="h-full rounded-full bg-linear-to-r from-brand-400 to-brand-600 transition-[width] duration-200" :style="{ width: `${progress}%` }" />
          </div>
          <p class="mt-1.5 text-xs text-muted">{{ progress < 100 ? `${progress}%` : 'Processing…' }}</p>
        </template>
        <template v-else>
          <p class="font-medium">{{ isDragging ? 'Drop to upload' : 'Drag & drop a PDF here' }}</p>
          <p class="mt-1 text-sm text-muted">
            or
            <button type="button" class="cursor-pointer font-medium text-brand-600 underline-offset-4 hover:underline dark:text-brand-300" @click="fileInput?.click()">browse your files</button>
            — each page will be converted to HTML.
          </p>
        </template>
        <p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-300">{{ error }}</p>
      </div>

      <button v-if="!isUploading" type="button" class="btn btn-ghost shrink-0" @click="fileInput?.click()">
        Choose PDF
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ uploaded: [] }>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const progress = ref(0)
const fileName = ref('')
const error = ref('')
let dragDepth = 0

function onDragEnter() {
  dragDepth++
  isDragging.value = true
}

function onDragLeave() {
  dragDepth = Math.max(0, dragDepth - 1)
  if (dragDepth === 0) isDragging.value = false
}

function onDrop(e: DragEvent) {
  dragDepth = 0
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) upload(file)
}

function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) upload(file)
}

function upload(file: File) {
  if (isUploading.value) return
  error.value = ''
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    error.value = 'Only PDF files can be uploaded.'
    return
  }

  isUploading.value = true
  progress.value = 0
  fileName.value = file.name

  const form = new FormData()
  form.append('pdf', file)

  // XHR instead of fetch to get upload progress events.
  const xhr = new XMLHttpRequest()
  xhr.open('POST', '/api/upload-pdf')
  xhr.upload.onprogress = (ev) => {
    if (ev.lengthComputable) progress.value = Math.round((ev.loaded / ev.total) * 100)
  }
  xhr.onload = () => {
    isUploading.value = false
    if (xhr.status >= 200 && xhr.status < 300) {
      emit('uploaded')
      return
    }
    let message = 'Unable to upload the PDF right now.'
    try {
      message = JSON.parse(xhr.responseText)?.statusMessage ?? message
    } catch {}
    error.value = message
  }
  xhr.onerror = () => {
    isUploading.value = false
    error.value = 'Network error — please try again.'
  }
  xhr.send(form)
}
</script>
