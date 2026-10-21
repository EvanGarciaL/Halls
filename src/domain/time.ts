/**
 * Represents a time of day in 24-hour format.
 *
 * Design notes:
 * - Renamed from the lowercase `time` to follow PascalCase conventions
 *   and avoid confusion with JavaScript's built-in Date.
 * - valueOf() enables numeric comparison (e.g. start <= now < end).
 * - Static formatting methods (toAMPM, to24) are pure functions —
 *   they take inputs and return strings with no side effects.
 */
export class TimeOfDay {
  readonly hour: number
  readonly minute: number

  /**
   * Create a TimeOfDay.
   * @param hour   Hour in 24-hour format (0–23). Defaults to current hour.
   * @param minute Minute (0–59). Defaults to current minute.
   */
  constructor(hour?: number, minute?: number) {
    if (hour !== undefined && minute !== undefined) {
      this.hour = hour
      this.minute = minute
    } else {
      const now = new Date()
      this.hour = now.getHours()
      this.minute = now.getMinutes()
    }
  }

  /**
   * Total minutes from 00:00. Useful for calculating intervals,
   * timeline positions, and durations.
   */
  toMinutes(): number {
    return this.hour * 60 + this.minute
  }

  /**
   * Instance method to format as 12-hour AM/PM string.
   */
  formatAMPM(): string {
    return TimeOfDay.toAMPM(this.hour, this.minute)
  }

  /**
   * Numeric representation for comparison (e.g. 9:05 -> 905).
   */
  valueOf(): number {
    return this.hour * 100 + this.minute
  }


  /**
   * Format as 12-hour AM/PM string.
   *
   * @example
   * TimeOfDay.toAMPM(13, 30) // → "1:30 PM"
   * TimeOfDay.toAMPM(0, 0)   // → "12:00 AM"
   */
  static toAMPM(hour: number, minute: number): string {
    if (hour < 0 || hour >= 24) {
      throw new Error(`Hour out of bounds: ${hour}`)
    }

    const suffix = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 || hour === 12 ? 12 : hour % 12
    const displayMinute = minute.toString().padStart(2, '0')

    return `${displayHour}:${displayMinute} ${suffix}`
  }

  /**
   * Convert 12-hour AM/PM to 24-hour format string.
   *
   * @example
   * TimeOfDay.to24(1, 30, 'PM') // → "13:30"
   * TimeOfDay.to24(12, 0, 'AM') // → "00:00"
   */
  static to24(hour: number, minute: number, suffix: 'AM' | 'PM'): string {
    if (hour < 1 || hour > 12) {
      throw new Error(`Hour out of bounds for 12-hour format: ${hour}`)
    }

    let hour24: number
    if (suffix === 'AM') {
      hour24 = hour === 12 ? 0 : hour
    } else {
      hour24 = hour === 12 ? 12 : hour + 12
    }

    const displayHour = hour24.toString().padStart(2, '0')
    const displayMinute = minute.toString().padStart(2, '0')

    return `${displayHour}:${displayMinute}`
  }
}
