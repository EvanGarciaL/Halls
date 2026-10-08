import { ref, onMounted, type Ref } from 'vue'
import type { ClassMeeting } from '../domain/models'
import { fetchSchedule } from '../services/websoc-client'

/**
 * Composable that manages fetching and holding the schedule data.
 *
 * This is the "glue" between Vue's reactivity system and our plain
 * TypeScript service layer. The composable:
 * - Owns the reactive state (the class list, loading flag, error)
 * - Triggers the fetch on mount
 * - Exposes read-only refs to consumers
 *
 * Why a composable instead of putting this in App.vue?
 * → Single Responsibility: App.vue should only handle layout.
 * → Reusability: any component can call useSchedule() if needed.
 * → Testability: you can test the fetch logic separately from the UI.
 */
export function useSchedule() {
  const classes: Ref<ClassMeeting[]> = ref([])
  const isLoading = ref(false)
  const error: Ref<string | null> = ref(null)

  async function load() {
    isLoading.value = true
    error.value = null

    try {
      classes.value = await fetchSchedule()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load schedule'
      console.error('Schedule fetch failed:', e)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(load)

  return {
    classes,
    isLoading,
    error,
    /** Re-fetch the schedule (e.g. after a quarter change). */
    refresh: load,
  }
}
