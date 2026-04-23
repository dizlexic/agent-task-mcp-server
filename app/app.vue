<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()
const { public: { siteName } } = useRuntimeConfig()
useHead({ title: siteName })

const isDark = ref(false)
const mobileMenuOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

onMounted(() => {
  const saved = localStorage.getItem('moo-dark-mode')
  if (saved !== null) {
    isDark.value = saved === 'true'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyDarkMode(isDark.value)
})

function applyDarkMode(dark: boolean) {
  document.documentElement.classList.add('transitioning')
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  setTimeout(() => document.documentElement.classList.remove('transitioning'), 350)
}

function toggleDark() {
  isDark.value = !isDark.value
  localStorage.setItem('moo-dark-mode', String(isDark.value))
  applyDarkMode(isDark.value)
}

async function logout() {
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-surface-dark transition-colors duration-500">
    <a href="#main-content" class="skip-to-content">Skip to content</a>

    <header
      v-if="loggedIn"
      role="banner"
      class="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-surface-dark/70 border-b border-gray-200 dark:border-surface-border/50 px-6 py-4 flex items-center justify-between"
    >
      <NuxtLink
        to="/dashboard"
        class="flex items-center gap-2 text-xl font-black text-gray-900 dark:text-white hover:text-neon-cyan dark:hover:text-neon-cyan transition-all group"
        aria-label="Go to dashboard"
      >
        <span class="text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">🐄</span>
        <span class="tracking-tight">{{ siteName }}</span>
      </NuxtLink>
      <div class="flex items-center gap-6">
        <nav class="hidden md:flex items-center gap-6" aria-label="Main navigation">
          <NuxtLink
            to="/dashboard"
            class="neon-underline text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-neon-cyan dark:hover:text-neon-cyan transition-colors py-1"
            active-class="text-neon-cyan dark:text-neon-cyan"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/settings/instructions"
            class="neon-underline text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-neon-cyan dark:hover:text-neon-cyan transition-colors py-1"
            active-class="text-neon-cyan dark:text-neon-cyan"
          >
            Instructions
          </NuxtLink>
        </nav>
        <div class="h-4 w-[1px] bg-gray-200 dark:bg-surface-border hidden md:block"></div>
        <div class="flex items-center gap-3">
          <span class="hidden sm:inline text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">{{ user?.name }}</span>
          <button
            @click="toggleDark"
            class="p-2 rounded-xl bg-gray-100 dark:bg-surface-raised text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-surface-hover hover:text-neon-cyan dark:hover:text-neon-cyan transition-all shadow-sm"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <span v-if="isDark" class="text-lg" aria-hidden="true">☀️</span>
            <span v-else class="text-lg" aria-hidden="true">🌙</span>
          </button>
          <button
            @click="logout"
            class="hidden md:inline-flex text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl border border-gray-200 dark:border-surface-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-raised hover:text-neon-pink dark:hover:text-neon-pink transition-all"
            aria-label="Log out"
          >
            Logout
          </button>
          <!-- Mobile hamburger -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-surface-raised text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-surface-hover transition-all"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
            aria-controls="mobile-menu"
            :aria-expanded="mobileMenuOpen"
          >
            <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile menu dropdown -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="loggedIn && mobileMenuOpen"
        id="mobile-menu"
        class="md:hidden sticky top-[73px] z-30 bg-white/95 dark:bg-surface-card/95 backdrop-blur-xl border-b border-gray-200 dark:border-surface-border/50 px-6 py-4 space-y-3"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <NuxtLink
          to="/dashboard"
          class="block text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:text-neon-cyan dark:hover:text-neon-cyan transition-colors py-2"
          active-class="text-neon-cyan dark:text-neon-cyan"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/settings/instructions"
          class="block text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:text-neon-cyan dark:hover:text-neon-cyan transition-colors py-2"
          active-class="text-neon-cyan dark:text-neon-cyan"
        >
          Instructions
        </NuxtLink>
        <div class="pt-2 border-t border-gray-100 dark:border-surface-border/50">
          <button
            @click="logout"
            class="w-full text-left text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-neon-pink dark:hover:text-neon-pink transition-colors py-2"
          >
            Logout
          </button>
        </div>
      </div>
    </transition>

    <main id="main-content" class="flex-1" role="main">
      <NuxtPage />
    </main>
    <footer role="contentinfo" class="py-8 px-6 border-t border-gray-200 dark:border-surface-border/30 text-center">
      <div class="flex flex-col items-center gap-4">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
          Built with <span class="text-neon-pink" aria-label="love">♥</span> by 🐄 Moo Tasks •
          <a
            href="https://github.com/dizlexic/moo-agent-board"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-neon-cyan transition-all"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>
