<script setup lang="ts">
const currentBoardName = useState<string | null>('currentBoardName', () => null)
const currentBoardDescription = useState<string | null>('currentBoardDescription', () => null)

const { loggedIn, user, clear } = useUserSession()
const { public: { siteName } } = useRuntimeConfig()

useHead({
  title: computed(() => currentBoardName.value || siteName)
})

const isDark = ref(false)
const mobileMenuOpen = ref(false)
const showUserDropdown = ref(false)
const route = useRoute()
const isOnBoard = computed(() => route.path.startsWith('/boards/'))

watch(() => route.path, (path) => {
  mobileMenuOpen.value = false
  if (!path.startsWith('/boards/')) {
    currentBoardName.value = null
    currentBoardDescription.value = null
  }
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
    <GoogleAnalytics />
    <a href="#main-content" class="skip-to-content">Skip to content</a>

    <header
      v-if="loggedIn"
      role="banner"
      class="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-surface-dark/70 border-b border-gray-200 dark:border-surface-border/50 px-6 py-4 flex items-center justify-between"
    >
      <div class="flex items-center gap-4 min-w-0">
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-2 text-xl font-black text-gray-900 dark:text-white hover:text-neon-cyan dark:hover:text-neon-cyan transition-all group min-w-0"
          aria-label="Go to dashboard"
        >
          <span class="text-2xl group-hover:scale-110 transition-transform shrink-0" aria-hidden="true">🐄</span>
        </NuxtLink>
        <div class="flex flex-col min-w-0">
          <NuxtLink
            v-if="!isOnBoard"
            to="/dashboard"
            class="text-xl font-black text-gray-900 dark:text-white hover:text-neon-cyan dark:hover:text-neon-cyan transition-all group min-w-0"
            aria-label="Go to dashboard"
          >
            <span class="tracking-tight truncate">{{ currentBoardName || siteName }}</span>
          </NuxtLink>
          <span v-else class="text-xl font-black text-gray-900 dark:text-white transition-all min-w-0">
            <span class="tracking-tight truncate">{{ currentBoardName || siteName }}</span>
          </span>
          <span v-if="currentBoardName && currentBoardDescription" class="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 truncate max-w-sm">{{ currentBoardDescription }}</span>
        </div>
      </div>
      <div class="flex items-center gap-6">
        <div id="board-actions-teleport" class="flex items-center gap-3"></div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <button
              aria-label="User menu"
              title="User menu"
              @click="showUserDropdown = !showUserDropdown"
              class="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter hover:text-neon-cyan dark:hover:text-neon-cyan transition-colors"
            >
              {{ user?.name }}
              <span class="text-[10px] opacity-50" aria-hidden="true">▼</span>
            </button>
            <div
              v-if="showUserDropdown"
              class="fixed inset-0 z-40"
              @click="showUserDropdown = false"
            ></div>
            <div
              v-if="showUserDropdown"
              class="absolute right-0 top-full mt-2 w-48 py-2 bg-white dark:bg-surface-card border border-gray-200 dark:border-surface-border rounded-xl shadow-xl z-50"
            >
              <NuxtLink
                to="/dashboard"
                class="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-raised hover:text-neon-cyan dark:hover:text-neon-cyan transition-colors"
                @click="showUserDropdown = false"
                title="Go to dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </NuxtLink>
              <NuxtLink
                to="/settings/instructions"
                class="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-raised hover:text-neon-cyan dark:hover:text-neon-cyan transition-colors"
                @click="showUserDropdown = false"
                title="View instructions"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instructions
              </NuxtLink>
              <button
                @click="toggleDark(); showUserDropdown = false"
                class="flex w-full items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-raised hover:text-neon-cyan dark:hover:text-neon-cyan transition-colors active:scale-95"
                title="Toggle theme"
              >
                <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {{ isDark ? 'Light Mode' : 'Dark Mode' }}
              </button>
              <div class="border-t border-gray-100 dark:border-surface-border/50 my-1"></div>
              <button
                @click="logout(); showUserDropdown = false"
                class="flex w-full items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-raised hover:text-neon-pink dark:hover:text-neon-pink transition-colors active:scale-95"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
          <!-- Mobile hamburger -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-surface-raised text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-surface-hover transition-all active:scale-95"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
            :title="mobileMenuOpen ? 'Close menu' : 'Open menu'"
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
      </div>
    </transition>

    <main id="main-content" class="flex-1" role="main">
      <NuxtPage />
    </main>
    <footer role="contentinfo" class="relative z-50 py-8 px-6 border-t border-gray-200 dark:border-surface-border/30 text-center">
      <div class="flex flex-col items-center gap-4">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
          Built with <span class="text-neon-pink" aria-label="love">♥</span> by 🐄 <a href="https://buymeacoffee.com/dizlexic" target="_blank" rel="noopener noreferrer" class="hover:text-neon-cyan transition-all">dizlexic</a> •
          <NuxtLink to="/faq" class="hover:text-neon-cyan transition-all">FAQ</NuxtLink> •
          <NuxtLink to="/about" class="hover:text-neon-cyan transition-all">About</NuxtLink> •
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
