export default defineNuxtRouteMiddleware(async (to) => {
  const user = useCurrentUser()
  const isPublic = to.path === '/'

  try {
    const res = await $fetch<{ username: string }>('/api/auth/session', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
    })
    user.value = res.username
  } catch {
    user.value = null
    if (!isPublic) return navigateTo('/')
    return
  }

  // Logged-in users skip the landing page.
  if (isPublic) return navigateTo('/pdf')
})
