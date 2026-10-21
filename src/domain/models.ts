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
  /** Section type (e.g. "Lec", "Dis", "Lab", "Sem", etc.) */
  sectionType: string
  sectionCode?: string
  instructors?: string[]
}

/** Status of a building/room for a specific day at the query time. */
export interface DayStatus {
  day: Day
  isInSession: boolean
  meeting?: ClassMeeting
  freeStart?: TimeOfDay
  freeEnd?: TimeOfDay
}

/** Grouped representation of a hall (building + room) and its meetings. */
export interface BuildingHall {
  building: string
  meetings: ClassMeeting[]
  dayStatuses: DayStatus[]
  isFreeOnAnyDay: boolean
  isInSessionOnAnyDay: boolean
  currentMeetings: ClassMeeting[]
}


