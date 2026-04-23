export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login', { replace: true })
  }

  if (loggedIn.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard', { replace: true })
  }
})
