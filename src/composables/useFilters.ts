import { ref, computed, type Ref } from 'vue'
import type { ClassMeeting, Day } from '../domain/models'
import { TimeOfDay } from '../domain/time'

/**
 * Composable that manages the filter state and produces a filtered
 * list of classes.
 *
 * Extracted from App.vue's inline computed properties. This gives us:
 * - A clear, named API: `daysSelected`, `timeSelected`, `filteredClasses`
 * - Decoupled filter logic that can be unit-tested without a DOM
 * - Easy extensibility (add a building filter, instructor search, etc.)
 *
 * @param classes - The full list of classes to filter (reactive ref).
 */
export function useFilters(classes: Ref<ClassMeeting[]>) {
  /** Which days are currently selected. Empty = show all days. */
  const daysSelected: Ref<Set<Day>> = ref(new Set())

  /** The time to filter by. Defaults to "right now." */
  const timeSelected: Ref<TimeOfDay> = ref(new TimeOfDay())

  /**
   * Two-way computed for binding to an <input type="time">.
   * Converts between the "HH:MM" string format that HTML inputs use
   * and our TimeOfDay domain object.
   */
  const timeInput = computed({
    get(): string {
      const t = timeSelected.value
      return `${t.hour.toString().padStart(2, '0')}:${t.minute.toString().padStart(2, '0')}`
    },
    set(newTime: string) {
      const hour = Number(newTime.slice(0, 2))
      const minute = Number(newTime.slice(3, 5))
      timeSelected.value = new TimeOfDay(hour, minute)
    },
  })

  /**
   * The filtered class list — recomputes whenever `classes`,
   * `daysSelected`, or `timeSelected` changes.
   */
  const filteredClasses = computed(() => {
    return classes.value
      .filter((meeting) => matchesDays(meeting, daysSelected.value))
      .filter((meeting) => matchesTime(meeting, timeSelected.value))
  })

  /**
   * Toggle a day in/out of the selected set.
   * Cleaner than managing v-model on a Set directly.
   */
  function toggleDay(day: Day) {
    const current = daysSelected.value
    const next = new Set(current)
    if (next.has(day)) {
      next.delete(day)
    } else {
      next.add(day)
    }
    daysSelected.value = next
  }

  return {
    daysSelected,
    timeSelected,
    timeInput,
    filteredClasses,
    toggleDay,
  }
}


// ── Pure filter predicates ───────────────────────────────────────────
// These are plain functions, not methods — easy to test in isolation.

/** Returns true if the meeting runs on ALL of the selected days. */
function matchesDays(meeting: ClassMeeting, selected: Set<Day>): boolean {
  if (selected.size === 0) return true
  for (const day of selected) {
    if (!meeting.days.has(day)) return false
  }
  return true
}

/** Returns true if the given time falls within the meeting's time range. */
function matchesTime(meeting: ClassMeeting, time: TimeOfDay): boolean {
  const now = time.valueOf()
  return meeting.startTime.valueOf() <= now && now < meeting.endTime.valueOf()
}
