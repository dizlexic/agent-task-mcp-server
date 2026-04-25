<script setup lang="ts">
definePageMeta({ layout: false })
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-surface-dark flex flex-col items-center justify-center px-4 transition-colors duration-500 neon-grid-bg">
    <div class="neon-orb neon-orb-cyan" aria-hidden="true"></div>
    <div class="neon-orb neon-orb-purple" aria-hidden="true"></div>

    <div class="relative z-10 bg-white dark:bg-surface-card rounded-3xl shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] w-full max-w-md p-10 border border-gray-200 dark:border-surface-border text-center">
      <div class="text-6xl mb-6">✨</div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Email Verified!</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-8">Your email has been successfully verified. You can now start using your account.</p>
      <NuxtLink to="/dashboard" class="inline-block w-full px-4 py-3.5 text-xs font-black uppercase tracking-widest bg-neon-cyan text-cyan-950 dark:text-gray-900 rounded-xl hover:bg-neon-cyan/90 transition-all hover:shadow-lg hover:shadow-neon-cyan/20">
        Go to Dashboard
      </NuxtLink>
    </div>
  </div>
</template>
