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
