export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/verify-email-success', '/about', '/faq']
  if (!loggedIn.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login', { replace: true })
  }

  if (loggedIn.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard', { replace: true })
  }
})
