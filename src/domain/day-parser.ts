import type { Day } from './models'

/**
 * Parse a WebSOC day string into a Set of individual Day codes.
 *
 * WebSOC uses concatenated codes: "MWF", "TuTh", "MTuWThF".
 * Single-letter days (M, W, F) and two-letter days (Tu, Th) are packed
 * together with no delimiter, so we consume greedily: if the next two
 * characters form "Tu" or "Th", take two; otherwise take one.
 *
 * @example
 * parseDays("MWF")     // → Set { "M", "W", "F" }
 * parseDays("TuTh")    // → Set { "Tu", "Th" }
 * parseDays("MTuWThF") // → Set { "M", "Tu", "W", "Th", "F" }
 */
export function parseDays(days: string): Set<Day> {
  const daySet = new Set<Day>()
  let remaining = days

  while (remaining.length > 0) {
    const twoChar = remaining.slice(0, 2)

    // Fix: original had an operator-precedence bug where || bound before &&.
    // The parentheses here make the intent explicit.
    if (remaining.length >= 2 && (twoChar === 'Tu' || twoChar === 'Th')) {
      daySet.add(twoChar as Day)
      remaining = remaining.slice(2)
    } else {
      daySet.add(remaining[0] as Day)
      remaining = remaining.slice(1)
    }
  }

  return daySet
}
