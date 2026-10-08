import type { paths } from '../types/generated/anteater-api-types'
import type { ClassMeeting } from '../domain/models'
import { getCurrentQuarter } from './quarter'
import { parseScheduleResponse } from '../domain/schedule-parser'

/** The query parameters accepted by the WebSOC endpoint. */
type WebSocParams = paths['/v2/rest/websoc']['get']['parameters']['query']

/** The JSON body returned by the WebSOC endpoint. */
export type WebSocResponse =
  paths['/v2/rest/websoc']['get']['responses']['200']['content']['application/json']

const BASE_URL = 'https://anteaterapi.com/v2/rest/websoc'

/**
 * Build the full WebSOC API URL for the current quarter's lectures.
 *
 * Extracted as a separate function (instead of a module-level constant)
 * so it can be called at the right time and tested independently.
 */
export function buildWebSocUrl(): URL {
  const quarter = getCurrentQuarter()
  const params: WebSocParams = {
    year: quarter.year,
    quarter: quarter.quarter,
    sectionType: 'Lec',
  }

  const searchParams = new URLSearchParams(params as Record<string, string>)
  return new URL(`${BASE_URL}?${searchParams}`)
}

/**
 * Fetch the lecture schedule from UCI's Anteater API and return
 * domain-ready ClassMeeting objects.
 *
 * This is the single entry point the rest of the app uses to get data.
 * It handles:
 * 1. Building the URL (via buildWebSocUrl)
 * 2. Making the HTTP request
 * 3. Transforming the raw response into domain objects (via parseScheduleResponse)
 *
 * The caller never sees WebSocResponse — only ClassMeeting[].
 * That's "depend on abstractions, not concretions" in action.
 */
export async function fetchSchedule(): Promise<ClassMeeting[]> {
  const url = buildWebSocUrl()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`WebSOC API returned ${response.status}`)
  }

  const data: WebSocResponse = await response.json()
  return parseScheduleResponse(data)
}
