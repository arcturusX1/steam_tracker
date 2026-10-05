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
    lastPlayed: string|null;
}

export interface UserGameResponse{
    steamId: string;
    gameCount: number;
    totalPlaytimeHours: number;
    games: UserGame[]
}