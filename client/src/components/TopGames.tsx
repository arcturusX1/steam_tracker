import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrophyIcon } from "@phosphor-icons/react";
import GameArt from "@/components/GameArt";
import { formatHours } from "@/lib/dateFormat";
import { gamePath } from "@/lib/paths";
import type { ApiState } from "@/hooks/useApiData";
import type { UserGame, UserAchievementsResponse } from "@/types/api";

interface TopGamesProps{
    games: UserGame[];
    steamId: string;
    achievements: ApiState<UserAchievementsResponse>;
}

interface TopGameCardProps{
    game: UserGame;
    rank: number;
    steamId: string;
    achievements: ApiState<UserAchievementsResponse>;
}

interface AchievementProgressProps{
    appId: number;
    name: string;
    state: ApiState<UserAchievementsResponse>;
}

//the achievements line of a card. the counts come from a separate request,
//so they load (or fail) on their own without holding up the rest of the card
function AchievementProgress({appId, name, state}: AchievementProgressProps){
    if(state.status === "loading"){
        return <Skeleton className="h-8 w-full"/>
    }

    const count = state.status === "success"
        ? state.data.achievements.find((achievement)=>achievement.appId === appId)
        : undefined

    if(!count){
        return <p className="text-xs text-muted-foreground">Achievements unavailable</p>
    }
    if(count.total === 0){
        return <p className="text-xs text-muted-foreground">No achievements</p>
    }

    const percent = Math.round(count.unlocked / count.total * 100)

    return(
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 tabular-nums">
                    <TrophyIcon className="size-3.5"/>
                    {count.unlocked} / {count.total} achievements
                </span>
                <span className="tabular-nums">{percent}%</span>
            </div>
            <Progress value={percent} aria-label={`${name} achievements unlocked`}/>
        </div>
    )
}

//one highlighted game. the whole card is a single link to the game page
function TopGameCard({game, rank, steamId, achievements}: TopGameCardProps){
    return(
        <Link to={gamePath(steamId, game.appId)} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full gap-4 pt-0 transition-shadow group-hover:ring-foreground/30">
                <div className="relative">
                    <GameArt src={game.headerUrl} alt=""/>
                    <Badge className="absolute top-2 left-2 tabular-nums">#{rank}</Badge>
                </div>
                <CardContent className="flex flex-1 flex-col gap-3">
                    <h3 className="truncate font-heading font-semibold underline-offset-4 group-hover:underline">
                        {game.name}
                    </h3>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-semibold tabular-nums">{formatHours(game.playtimeHours)}</span>
                        {game.recentHours > 0 && (
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {formatHours(game.recentHours)} recently
                            </span>
                        )}
                    </div>
                    <div className="mt-auto">
                        <AchievementProgress appId={game.appId} name={game.name} state={achievements}/>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export default function TopGames({games, steamId, achievements}: TopGamesProps){
    return(
        <section className="flex flex-col gap-3">
            <h2 className="font-heading text-lg font-semibold">Most played</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {games.map((game, index)=>(
                    <TopGameCard
                        key={game.appId}
                        game={game}
                        rank={index + 1}
                        steamId={steamId}
                        achievements={achievements}
                    />
                ))}
            </div>
        </section>
    )
}
