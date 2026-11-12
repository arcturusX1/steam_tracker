import type { PlayerSummary, OwnedGame, AppDetailsData, TopAchievementsGame } from "../types/steamResponseTypes.ts";

const ICON_BASE_URL = "https://media.steampowered.com/steamcommunity/public/images/apps";
const HEADER_BASE_URL = "https://cdn.akamai.steamstatic.com/steam/apps";
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
    headerUrl: string;
    lastPlayed: string | null;
}

//unlocked/total achievements for one game. total is 0 for games without achievements
export interface AchievementCount{
  appId: number;
  unlocked: number;
  total: number;
}

export interface GameDetails{
  appId: number;
  name: string;
  appType: string;
  shortDescription: string;
  headerImage: string;
  website: string | null;
  developers: string[];
  publishers: string[];
  genres: string[];
  platforms: string[];
  releaseDate: string | null;
  comingSoon: boolean;
  isFree: boolean;
  metacriticScore: number | null;
  recommendations: number | null;
  achievementCount: number;
  storeUrl: string;
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
    headerUrl: `${HEADER_BASE_URL}/${game.appid}/header.jpg`,
    lastPlayed: toIsoDate(game.rtime_last_played),
  };
}

export function toAchievementCount(game: TopAchievementsGame): AchievementCount{
  return {
    appId: game.appid,
    unlocked: game.achievements?.length ?? 0,
    total: game.total_achievements ?? 0,
  };
}

export function toGameDetails(app: AppDetailsData): GameDetails{
  const platforms: string[] = [];
  if (app.platforms.windows) platforms.push("Windows");
  if (app.platforms.mac) platforms.push("macOS");
  if (app.platforms.linux) platforms.push("Linux");

  return {
    appId: app.steam_appid,
    name: app.name,
    appType: app.type,
    shortDescription: decodeEntities(app.short_description),
    headerImage: app.header_image,
    website: app.website || null,
    developers: app.developers ?? [],
    publishers: app.publishers ?? [],
    genres: app.genres?.map((genre) => genre.description) ?? [],
    platforms,
    releaseDate: app.release_date.date || null,
    comingSoon: app.release_date.coming_soon,
    isFree: app.is_free,
    metacriticScore: app.metacritic?.score ?? null,
    recommendations: app.recommendations?.total ?? null,
    achievementCount: app.achievements?.total ?? 0,
    storeUrl: `https://store.steampowered.com/app/${app.steam_appid}/`,
  };
}

function decodeEntities(text: string): string{
  const decodedString = text
  .replaceAll("&quot;", "\"")
  .replaceAll("&#39;", "\'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&amp;", "&");
  return decodedString;
}
