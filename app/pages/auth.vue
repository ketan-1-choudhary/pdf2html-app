<template>
  <main class="auth-page">
    <section class="auth-card">
      <p class="eyebrow">PDF Converter</p>
      <h1>{{ isSignUp ? 'Create your account' : 'Welcome back' }}</h1>
      <p class="subtitle">{{ isSignUp ? 'Sign up to start converting.' : 'Sign in to continue.' }}</p>

      <form @submit.prevent="submit">
        <label>
          Username
          <input v-model.trim="username" autocomplete="username" required minlength="3" maxlength="30" placeholder="your_username" />
        </label>
        <label>
          Password
          <input v-model="password" :autocomplete="isSignUp ? 'new-password' : 'current-password'" required minlength="8" type="password" placeholder="At least 8 characters" />
        </label>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in' }}
        </button>
      </form>

      <button class="switch" type="button" @click="toggleMode">
        {{ isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up' }}
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
const router = useRouter()
const user = useCurrentUser()
const isSignUp = ref(false)
const username = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

function toggleMode() {
  isSignUp.value = !isSignUp.value
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
    await router.push('/')
  } catch (error: any) {
    errorMessage.value = error?.data?.message ?? 'Authentication failed.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: #101827;
  color: #eef2f7;
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.auth-card {
  width: min(100%, 420px);
  padding: 2.2rem;
  background: #182338;
  border: 1px solid #2c3d5b;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, .25);
}
.eyebrow {
  margin: 0 0 .6rem;
  color: #f0788c;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
}
h1 { margin: 0; font-size: 1.7rem; }
.subtitle { margin: .6rem 0 1.8rem; color: #9eabc0; line-height: 1.5; }
form { display: grid; gap: 1rem; }
label { display: grid; gap: .4rem; color: #c5cfde; font-size: .85rem; }
input {
  width: 100%;
  padding: .7rem .8rem;
  border: 1px solid #3a4c6d;
  border-radius: 6px;
  background: #101827;
  color: #eef2f7;
  outline: none;
}
input:focus { border-color: #f0788c; }
button {
  padding: .75rem 1rem;
  border: 0;
  border-radius: 6px;
  background: #e95f78;
  color: white;
  font-weight: 700;
  cursor: pointer;
}
button:disabled { cursor: wait; opacity: .6; }
.switch { width: 100%; margin-top: 1rem; background: transparent; color: #b7c4d8; font-weight: 500; }
.switch:hover { color: white; }
.error { margin: 0; color: #ff9aa9; font-size: .85rem; line-height: 1.4; }
</style>
