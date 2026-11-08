export interface VanityResponse {
  response: {
    success: number;
    steamid?: string;
    message?: string;
  };
}

export interface PlayerSummary {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatarfull: string;
  personastate: number;
  communityvisibilitystate: number;
  timecreated?: number;
  lastlogoff?: number;
}

export interface PlayerSummariesResponse {
  response: {
    players: PlayerSummary[];
  };
}//

export interface OwnedGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url: string;
  rtime_last_played: number;
}

export interface OwnedGamesResponse {
  response: {
    game_count?: number;
    games?: OwnedGame[];
  };
}

export interface AppDetailsData{
  type: string;
  name: string;
  steam_appid: number;
  is_free: boolean;
  short_description: string;
  header_image: string;
  website: string | null;
  developers?: string[];
  publishers?: string[];
  genres?: AppGenre[];
  platforms: AppPlatforms;
  release_date: AppReleaseDate;
  metacritic?: AppMetacritic;
  recommendations?: AppRecommendations;
  achievements?: AppAchievements; //steam doesn't always send these
}

export type AppDetailsEntry = {success: true; data: AppDetailsData} 
| {success: false}

export interface AppGenre{
  id: string;
  description: string;
}

export interface AppPlatforms{
  windows: boolean;
  mac: boolean;
  linux: boolean;
}

export interface AppReleaseDate{
  coming_soon: boolean;
  date: string;
}

export interface AppMetacritic{
  score: number;
}

export interface AppRecommendations{
  total: number;
}

export interface AppAchievements{
  total: number;
}

export type AppDetailsResponse = Record<string, AppDetailsEntry | undefined>