<template>
  <div class="card relative w-full overflow-hidden p-7 shadow-xl shadow-zinc-900/5 dark:shadow-black/30 sm:p-8">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-500/70 to-transparent" />

    <div class="mb-6 grid grid-cols-2 rounded-lg bg-surface-2 p-1 text-sm font-medium" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        role="tab"
        :aria-selected="mode === tab.value"
        class="cursor-pointer rounded-md py-2 transition"
        :class="mode === tab.value ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg'"
        @click="setMode(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <h2 class="text-xl font-semibold tracking-tight">
      {{ isSignUp ? 'Create your account' : 'Welcome back' }}
    </h2>
    <p class="mt-1 text-sm text-muted">
      {{ isSignUp ? 'Start turning PDFs into web pages in seconds.' : 'Sign in to pick up where you left off.' }}
    </p>

    <form class="mt-6 grid gap-4" @submit.prevent="submit">
      <label class="grid gap-1.5 text-sm font-medium">
        Username
        <input
          v-model.trim="username"
          class="input"
          autocomplete="username"
          required
          minlength="3"
          maxlength="30"
          placeholder="your_username"
        />
      </label>
      <label class="grid gap-1.5 text-sm font-medium">
        Password
        <input
          v-model="password"
          class="input"
          type="password"
          :autocomplete="isSignUp ? 'new-password' : 'current-password'"
          required
          minlength="8"
          placeholder="At least 8 characters"
        />
      </label>

      <p v-if="errorMessage" class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
        {{ errorMessage }}
      </p>

      <button type="submit" class="btn btn-primary mt-1 w-full py-2.5" :disabled="isSubmitting">
        <svg v-if="isSubmitting" class="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity=".25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        {{ isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
type Mode = 'signin' | 'signup'

const mode = defineModel<Mode>('mode', { default: 'signin' })
const tabs: { value: Mode, label: string }[] = [
  { value: 'signin', label: 'Sign in' },
  { value: 'signup', label: 'Sign up' },
]

const user = useCurrentUser()
const username = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const isSignUp = computed(() => mode.value === 'signup')

function setMode(next: Mode) {
  mode.value = next
  errorMessage.value = ''
}

async function submit() {
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{ username: string }>(
      isSignUp.value ? '/api/auth/signup' : '/api/auth/login',
      { method: 'POST', body: { user_id: username.value, password: password.value } },
    )
    user.value = res.username
    await navigateTo('/pdf')
  } catch (error: any) {
    errorMessage.value = error?.data?.message ?? 'Authentication failed.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
