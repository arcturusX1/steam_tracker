//need to update these interfaces when server has changes

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
    lastPlayed: string|null;
}

export interface UserGameResponse{
    steamId: string;
    gameCount: number;
    totalPlaytimeHours: number;
    games: UserGame[]
}

//unlocked/total achievements for one game. total is 0 for games without achievements
export interface AchievementCount{
    appId: number;
    unlocked: number;
    total: number;
}

//achievement counts for the user's 4 most played games
export interface UserAchievementsResponse{
    steamId: string;
    achievements: AchievementCount[];
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