export default defineNuxtRouteMiddleware(async (to) => {
  const user = useCurrentUser()

  try {
    const res = await $fetch<{ username: string }>('/api/auth/session', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
    })
    user.value = res.username
  } catch {
    user.value = null
    if (to.path !== '/auth') return navigateTo('/auth')
    return
  }

  // Logged-in users should not sit on the auth page.
  if (to.path === '/auth') return navigateTo('/')
})
