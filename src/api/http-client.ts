const BASE_URL = "'https://anteaterapi.com/v2/rest"


export async function apiFetch<T>(endpoint: string, params : Record<string, string>) : Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}?${new URLSearchParams(params)}`)
  const response = await fetch(url);

  if (!response.ok) {
    throw Error(`Unable to fetch from ${endpoint}: Status ${response.status}`)
  }

  return response.json()
}

