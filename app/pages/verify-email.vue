<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const token = route.query.token
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  if (!token || typeof token !== 'string') {
    error.value = 'Invalid token'
    loading.value = false
    return
  }

  try {
    await $fetch(`/api/auth/verify-email?token=${token}`, {
      method: 'GET',
    })
    await navigateTo('/verify-email-success')
  } catch (e: any) {
    error.value = e.data?.message || e.data?.statusMessage || 'Verification failed'
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-surface-dark flex flex-col items-center justify-center px-4 transition-colors duration-500 neon-grid-bg">
    <div class="neon-orb neon-orb-cyan" aria-hidden="true"></div>
    <div class="neon-orb neon-orb-purple" aria-hidden="true"></div>

    <div class="relative z-10 bg-white dark:bg-surface-card rounded-3xl shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] w-full max-w-md p-10 border border-gray-200 dark:border-surface-border text-center">
      <div v-if="loading" class="space-y-4">
        <div class="text-4xl animate-spin">⏳</div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Verifying your email...</h2>
      </div>
      <div v-else-if="error" class="space-y-4">
        <div class="text-4xl">❌</div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Verification Failed</h2>
        <p class="text-red-500">{{ error }}</p>
        <NuxtLink to="/login" class="inline-block text-neon-cyan font-bold hover:underline">Return to Login</NuxtLink>
      </div>
    </div>
  </div>
</template>
