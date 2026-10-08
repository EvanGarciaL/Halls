/**
 * Determine the current academic quarter based on today's date.
 *
 * Extracted from payload.ts so it's independently testable and reusable.
 * The original ran at module load time — now it runs when you call it,
 * which means tests can mock the date and the app can re-compute it.
 */

type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter'

export interface Quarter {
  year: string
  quarter: Season
}

const SEASON_BY_MONTH: readonly Season[] = [
  'Winter', 'Winter', 'Spring', // Jan, Feb, Mar
  'Spring', 'Spring', 'Summer', // Apr, May, Jun
  'Summer', 'Summer', 'Fall',   // Jul, Aug, Sep
  'Fall',   'Fall',   'Winter', // Oct, Nov, Dec
]

/**
 * Returns the current academic quarter and year.
 *
 * @example
 * getCurrentQuarter() // → { year: "2026", quarter: "Fall" }
 */
export function getCurrentQuarter(): Quarter {
  const now = new Date()
  return {
    year: String(now.getFullYear()),
    quarter: SEASON_BY_MONTH[now.getMonth()],
  }
}
