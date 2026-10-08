import type { paths } from "./types/anteater-api-types";
import { apiFetch } from "./http-client";

 type WebSocParams = paths['/v2/rest/websoc']['get']['parameters']['query']
 type WebSocResponse = paths['/v2/rest/websoc']['get']['responses']['200']['content']['application/json']

export function fetchWebSocSchedule(params: WebSocParams) : Promise<WebSocResponse> {
  return apiFetch<WebSocResponse>("/websoc", params as Record<string,string>);
}



