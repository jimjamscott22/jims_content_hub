import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useBookmarkView() {
  const route = useRoute()
  const router = useRouter()
  return computed({
    get: () => ['table', 'grid'].includes(route.query.view) ? route.query.view : 'list',
    set(value) {
      const query = { ...route.query }
      if (value === 'list') delete query.view
      else query.view = value
      router.replace({ query })
    },
  })
}
