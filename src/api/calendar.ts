import type { paths } from "./types/anteater-api-types";
import { apiFetch } from "./http-client";

 type CalendarParams = paths['/v2/rest/calendar']['get']['parameters']["query"]
 type CalendarResponse = paths['/v2/rest/calendar']['get']['responses']['200']['content']['application/json']

export function fetchCalenderDates(params : CalendarParams) : Promise<CalendarResponse>{
  return apiFetch<CalendarResponse>('/calendar', params)
}
