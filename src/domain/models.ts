import type { TimeOfDay } from './time'

/**
 * Valid day codes used in UCI's WebSOC schedule system.
 * Single-letter for M/W/F, two-letter for Tu/Th.
 */
export type Day = 'M' | 'Tu' | 'W' | 'Th' | 'F'

/**
 * A single class meeting — the domain object that the rest of the app works with.
 *
 * This replaces the old `Class` interface. Every field has a concrete type
 * (no unions like `Set<string> | string`), so consumers never need to guess.
 */
export interface ClassMeeting {
  /** Unique key derived from section code + days + start/end hours. */
  key: string
  school: string
  department: string
  /** e.g. "COMPSCI 161 - Design and Analysis of Algorithms" */
  course: string
  /** e.g. "ICS 180" */
  building: string
  /** Always a Set — the ambiguous `Set | string` union is gone. */
  days: Set<Day>
  startTime: TimeOfDay
  endTime: TimeOfDay
}

