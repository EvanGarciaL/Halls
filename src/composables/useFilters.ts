import { ref, computed, type Ref } from 'vue'
import type { ClassMeeting, Day, BuildingHall, DayStatus } from '../domain/models'
import { TimeOfDay } from '../domain/time'

export const ALL_WEEKDAYS: Day[] = ['M', 'Tu', 'W', 'Th', 'F']

export type FilterMode = 'in-session' | 'empty'

/**
 * Composable that manages filter state, hall grouping, free/occupied slot calculations,
 * and produces filtered BuildingHall domain objects.
 *
 * @param classes - The full list of classes to filter (reactive ref).
 */
export function useFilters(classes: Ref<ClassMeeting[]>) {
  /** Which days are currently selected. Empty = all weekdays. */
  const daysSelected: Ref<Set<Day>> = ref(new Set())

  /** The time to filter by. Defaults to current system time. */
  const timeSelected: Ref<TimeOfDay> = ref(new TimeOfDay())

  /** Display mode: 'in-session' or 'empty' (vacant halls) */
  const mode: Ref<FilterMode> = ref('in-session')

  /** Optional text search filter (building name, room, course) */
  const searchQuery: Ref<string> = ref('')

  /** Active days to evaluate: selected days, or all weekdays if none selected */
  const activeDays = computed<Day[]>(() => {
    if (daysSelected.value.size === 0) {
      return ALL_WEEKDAYS
    }
    return ALL_WEEKDAYS.filter(d => daysSelected.value.has(d))
  })

  /**
   * Two-way computed for binding to an <input type="time">.
   * Converts between the "HH:MM" string format and TimeOfDay domain object.
   */
  const timeInput = computed({
    get(): string {
      const t = timeSelected.value
      return `${t.hour.toString().padStart(2, '0')}:${t.minute.toString().padStart(2, '0')}`
    },
    set(newTime: string) {
      if (!newTime) return
      const hour = Number(newTime.slice(0, 2))
      const minute = Number(newTime.slice(3, 5))
      if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
        timeSelected.value = new TimeOfDay(hour, minute)
      }
    },
  })

  /** Reset the filter time to right now */
  function resetTimeToNow() {
    timeSelected.value = new TimeOfDay()
  }

  /** Toggle a day in/out of the selected set. */
  function toggleDay(day: Day) {
    const next = new Set(daysSelected.value)
    if (next.has(day)) {
      next.delete(day)
    } else {
      next.add(day)
    }
    daysSelected.value = next
  }

  /** Select all weekdays or clear */
  function selectAllDays() {
    daysSelected.value = new Set(ALL_WEEKDAYS)
  }

  function clearDays() {
    daysSelected.value = new Set()
  }

  /** Group all meetings by unique building/room */
  const meetingsByBuilding = computed(() => {
    const map = new Map<string, ClassMeeting[]>()
    for (const meeting of classes.value) {
      const list = map.get(meeting.building)
      if (list) {
        list.push(meeting)
      } else {
        map.set(meeting.building, [meeting])
      }
    }
    return map
  })

  /**
   * Compute BuildingHall objects containing daily statuses, free windows,
   * and in-session indicators for every room.
   */
  const buildingHalls = computed<BuildingHall[]>(() => {
    const halls: BuildingHall[] = []
    const targetMins = timeSelected.value.toMinutes()
    const days = activeDays.value

    for (const [building, meetings] of meetingsByBuilding.value.entries()) {
      const dayStatuses: DayStatus[] = []
      const currentMeetingsSet = new Map<string, ClassMeeting>()

      for (const day of days) {
        // Filter meetings for this day and sort chronologically
        const dayMeetings = meetings
          .filter(m => m.days.has(day))
          .sort((a, b) => a.startTime.toMinutes() - b.startTime.toMinutes())

        const curr = dayMeetings.find(
          m => m.startTime.toMinutes() <= targetMins && targetMins < m.endTime.toMinutes()
        )

        if (curr) {
          dayStatuses.push({
            day,
            isInSession: true,
            meeting: curr,
          })
          currentMeetingsSet.set(curr.key, curr)
        } else {
          // Free period:
          // Last class that ended at or before target time
          const prevClasses = dayMeetings.filter(m => m.endTime.toMinutes() <= targetMins)
          const lastClass = prevClasses.length > 0 ? prevClasses[prevClasses.length - 1] : undefined
          const freeStart = lastClass ? lastClass.endTime : new TimeOfDay(7, 0)

          // Next class that starts after target time
          const nextClasses = dayMeetings.filter(m => m.startTime.toMinutes() > targetMins)
          const nextClass = nextClasses.length > 0 ? nextClasses[0] : undefined
          // If no next class today, ends at 10pm (22:00) as specified
          const freeEnd = nextClass ? nextClass.startTime : new TimeOfDay(22, 0)

          dayStatuses.push({
            day,
            isInSession: false,
            freeStart,
            freeEnd,
          })
        }
      }

      const isFreeOnAnyDay = dayStatuses.some(ds => !ds.isInSession)
      const isInSessionOnAnyDay = dayStatuses.some(ds => ds.isInSession)

      halls.push({
        building,
        meetings,
        dayStatuses,
        isFreeOnAnyDay,
        isInSessionOnAnyDay,
        currentMeetings: Array.from(currentMeetingsSet.values()),
      })
    }

    // Sort alphanumerically (e.g. BS3 1200, DBH 1100, ICS 174, ICS 180)
    halls.sort((a, b) =>
      a.building.localeCompare(b.building, undefined, { numeric: true, sensitivity: 'base' })
    )

    return halls
  })

  /** Filter halls according to active mode ('in-session' vs 'empty') and search query */
  const filteredHalls = computed<BuildingHall[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()

    return buildingHalls.value.filter(hall => {
      // Mode filter
      if (mode.value === 'in-session') {
        if (!hall.isInSessionOnAnyDay) return false
      } else {
        // empty mode: hall must be free on at least one selected day
        if (!hall.isFreeOnAnyDay) return false
      }

      // Search filter
      if (q) {
        const matchesBuilding = hall.building.toLowerCase().includes(q)
        const matchesCourse = hall.meetings.some(
          m =>
            m.course.toLowerCase().includes(q) ||
            m.department.toLowerCase().includes(q) ||
            m.school.toLowerCase().includes(q) ||
            (m.sectionCode && m.sectionCode.toLowerCase().includes(q))
        )
        if (!matchesBuilding && !matchesCourse) return false
      }

      return true
    })
  })

  return {
    daysSelected,
    timeSelected,
    timeInput,
    mode,
    searchQuery,
    activeDays,
    buildingHalls,
    filteredHalls,
    toggleDay,
    selectAllDays,
    clearDays,
    resetTimeToNow,
  }
}
