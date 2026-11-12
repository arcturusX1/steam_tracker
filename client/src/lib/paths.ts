//the page for one game in a user's library. steamId is always 17 digits, so nothing needs encoding
export function gamePath(steamId: string, appId: number): string{
    return `/user/${steamId}/games/${appId}`
}
