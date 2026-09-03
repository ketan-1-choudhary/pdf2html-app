<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <h1>PDF → HTML Converter</h1>
      <div class="header-actions">
        <button class="btn btn--primary" @click="createDraft" :disabled="isCreating">
          {{ isCreating ? 'Creating…' : '+ New draft' }}
        </button>
        <button class="btn btn--outline" @click="logout" :disabled="isLoggingOut">
          {{ isLoggingOut ? 'Logging out…' : 'Logout' }}
        </button>
      </div>
    </header>

    <!-- Drafts -->
    <section class="drafts">
      <p v-if="listError" class="error-msg">{{ listError }}</p>

      <div v-if="pending" class="hint">Loading your drafts…</div>

      <div v-else-if="drafts.length === 0" class="empty">
        <p>No drafts yet.</p>
        <p class="empty__sub">Create a new draft to start editing.</p>
      </div>

      <ul v-else class="draft-grid">
        <li v-for="draft in drafts" :key="draft.pdf_id" class="draft-card">
          <NuxtLink :to="`/pdf/${draft.pdf_id}/page/1`" class="draft-card__link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span class="draft-card__name">{{ draft.pdf_name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface PdfDraft {
  pdf_id: string
  pdf_name: string
}

const listError = ref('')

// SSR-friendly fetch of the current user's drafts.
const { data, pending, refresh } = await useFetch<{ drafts: PdfDraft[] }>('/api/pdf', {
  onResponseError() {
    listError.value = 'Unable to load your drafts right now.'
  },
})

const drafts = computed(() => data.value?.drafts ?? [])

const isCreating = ref(false)

async function createDraft() {
  isCreating.value = true
  listError.value = ''
  try {
    const res = await $fetch<{ pdf_id: string }>('/api/pdf', { method: 'POST', body: {} })
    await navigateTo(`/pdf/${res.pdf_id}/page/1`)
  } catch (err: any) {
    console.error('[createDraft] failed:', err)
    listError.value = err?.data?.statusMessage ?? 'Unable to create a draft right now.'
    await refresh()
  } finally {
    isCreating.value = false
  }
}

const user = useCurrentUser()
const isLoggingOut = ref(false)

async function logout() {
  isLoggingOut.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/auth')
  } catch (err: any) {
    console.error('[logout] failed:', err)
    listError.value = 'Unable to log out right now.'
  } finally {
    isLoggingOut.value = false
  }
}
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
  justify-content: space-between;
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

/* Drafts */
.drafts {
  flex: 1;
  overflow: auto;
  padding: 1.2rem;
}

.hint { color: #888; font-size: 0.9rem; }

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  text-align: center;
}
.empty p { margin: 0.2rem 0; }
.empty__sub { font-size: 0.85rem; color: #666; }

.draft-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.8rem;
}

.draft-card {
  background: #16213e;
  border: 1px solid #0f3460;
  border-radius: 8px;
  transition: border-color 0.15s, transform 0.15s;
}
.draft-card:hover { border-color: #e94560; transform: translateY(-2px); }

.draft-card__link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem;
  color: #e0e0e0;
  text-decoration: none;
}
.draft-card__link svg { color: #e94560; flex-shrink: 0; }

.draft-card__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

.error-msg {
  margin: 0 0 0.8rem;
  font-size: 0.85rem;
  color: #e94560;
}

/* Buttons */
.btn {
  padding: 0.35rem 0.9rem;
  border-radius: 4px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s, background 0.15s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--primary { background: #e94560; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #c73652; }
.btn--outline { background: transparent; color: #aaa; border: 1px solid #0f3460; }
.btn--outline:hover:not(:disabled) { border-color: #aaa; color: #fff; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
