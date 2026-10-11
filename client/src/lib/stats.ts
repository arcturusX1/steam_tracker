import type { UserGame, UserGameResponse } from "@/types/api";

export interface LibraryStats{
    totalHours: number;
    gameCount: number;
    unplayedCount: number;
    playedPercent: number;
    mostPlayed: UserGame | null;
    recentHours: number;
    recentGames: UserGame[] 
}

export function computeStats(data: UserGameResponse): LibraryStats{
    
    //these values are for/from specific games only: access individual UserGame[] 
    const unplayedCount = data.games.filter((game)=>game.playtimeHours===0).length
    const playedPercent = data.gameCount === 0? 0 : Math.round((data.gameCount - unplayedCount) / data.gameCount * 100)
    const mostPlayed = data.games.length > 0? data.games[0] : null
    const recentGames = data.games.filter((game)=>game.recentHours > 0).toSorted((a,b)=>b.recentHours - a.recentHours)
    //reduce counts things. sum is where ther result is stored, adds recentHours for all games to it, starts at 0
    const recentHours = Math.round(recentGames.reduce((sum, game)=>sum + game.recentHours, 0)*10)/10

    return {totalHours: data.totalPlaytimeHours, 
            gameCount: data.gameCount,
            unplayedCount,
            playedPercent,
            mostPlayed,
            recentHours,
            recentGames
    }
}