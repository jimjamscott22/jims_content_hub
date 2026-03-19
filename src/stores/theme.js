import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'jch-theme-mode'
const VALID_MODES = new Set(['light', 'dark', 'system'])
const DARK_MODE_QUERY = '(prefers-color-scheme: dark)'

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function getSystemTheme() {
  if (!isBrowser() || !window.matchMedia) {
    return 'light'
  }

  return window.matchMedia(DARK_MODE_QUERY).matches ? 'dark' : 'light'
}

function normalizeMode(value) {
  return VALID_MODES.has(value) ? value : 'system'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref('system')
  const systemTheme = ref(getSystemTheme())
  const mediaQuery = isBrowser() && window.matchMedia ? window.matchMedia(DARK_MODE_QUERY) : null

  const effectiveTheme = computed(() => (mode.value === 'system' ? systemTheme.value : mode.value))

  const applyTheme = () => {
    if (!isBrowser()) {
      return
    }

    document.documentElement.setAttribute('data-theme', effectiveTheme.value)
  }

  const setMode = (nextMode) => {
    mode.value = normalizeMode(nextMode)

    if (isBrowser()) {
      window.localStorage.setItem(STORAGE_KEY, mode.value)
    }

    applyTheme()
  }

  const toggleTheme = () => {
    const next = effectiveTheme.value === 'dark' ? 'light' : 'dark'
    setMode(next)
  }

  const handleSystemThemeChange = (event) => {
    systemTheme.value = event.matches ? 'dark' : 'light'
    applyTheme()
  }

  const initTheme = () => {
    if (isBrowser()) {
      const storedMode = window.localStorage.getItem(STORAGE_KEY)
      mode.value = normalizeMode(storedMode)
    }

    systemTheme.value = getSystemTheme()
    applyTheme()

    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    }
  }

  return {
    mode,
    effectiveTheme,
    initTheme,
    setMode,
    toggleTheme,
  }
})
