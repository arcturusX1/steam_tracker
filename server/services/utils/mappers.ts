import type { PlayerSummary, OwnedGame } from "../types/steamResponseTypes.ts";

const ICON_BASE_URL = "https://media.steampowered.com/steamcommunity/public/images/apps";
const userStatus = ["offline", "online", "busy", "away", "snooze", "looking to trade", "looking to play"];

//time conversion helpers
function toIsoDate(seconds?: number): string | null{
    return seconds? new Date(seconds * 1000).toISOString() : null
}

export function toHours(minutes: number): number{
    return Math.round((minutes/60)*10)/10;
}
export interface UserProfile{
  steamId: string;
  displayName: string;
  avatar: string;
  profileUrl: string;
  status: string;
  isPublic: boolean;
  createdAt: string | null;
}

export interface UserGame{
    appId: number;
    name: string;
    playtimeHours: number;
    recentHours: number;
    iconUrl: string | null;
    lastPlayed: string | null;
}

//maps fetched data from service, cached
export function toProfile(player: PlayerSummary):UserProfile {
  return {
    steamId: player.steamid,
    displayName: player.personaname,
    avatar: player.avatarfull,
    profileUrl: player.profileurl,
    status: userStatus[player.personastate] ?? "unknown",
    isPublic: player.communityvisibilitystate === 3,
    createdAt: toIsoDate(player.timecreated),
  };
}

export function toGame(game: OwnedGame):UserGame {
  return {
    appId: game.appid,
    name: game.name,
    playtimeHours: toHours(game.playtime_forever),
    recentHours: toHours(game.playtime_2weeks ?? 0),
    iconUrl: game.img_icon_url ? `${ICON_BASE_URL}/${game.appid}/${game.img_icon_url}.jpg` : null,
    lastPlayed: toIsoDate(game.rtime_last_played),
  };
}