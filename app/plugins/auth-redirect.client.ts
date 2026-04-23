export default defineNuxtPlugin(() => {
  const { clear } = useUserSession()

  globalThis.$fetch = new Proxy(globalThis.$fetch, {
    apply(target, thisArg, args) {
      return Reflect.apply(target, thisArg, args).catch(async (error: any) => {
        if (error?.response?.status === 401) {
          await clear()
          await navigateTo('/login', { replace: true })
        }
        throw error
      })
    },
  })
})
