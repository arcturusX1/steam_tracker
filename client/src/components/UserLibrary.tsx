import {Link} from "react-router";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, 
    EmptyContent, 
    EmptyDescription, 
    EmptyHeader, 
    EmptyTitle,
    EmptyMedia } from "@/components/ui/empty";
import { useApiData } from "@/hooks/useApiData";
import { fetchUser, fetchUserGames, fetchUserAchievements, errorMessage } from "@/lib/api";
import type { ApiState } from "@/hooks/useApiData";
import type { UserGameResponse, UserAchievementsResponse } from "@/types/api";
import { WarningCircleIcon, LockIcon, UserCircleIcon } from "@phosphor-icons/react";
import ProfileHeader from "@/components/ProfileHeader";
import StatCards from "@/components/StatCards";
import { computeStats } from "@/lib/stats";
import GamesTable from "@/components/GamesTable";
import TopGames from "@/components/TopGames";

//must match TOP_GAMES_COUNT in the server's userService, which picks the games the achievement counts are for
const TOP_GAMES_COUNT = 4;

interface UserLibraryProps{
    input: string;
}

export default function UserLibrary({input}:UserLibraryProps){
    const profile = useApiData(input, fetchUser)
    const games = useApiData(input, fetchUserGames)
    const achievements = useApiData(input, fetchUserAchievements)
    
    //loading return
    if(profile.status === "loading"){
        //roughly the shape of the profile card, so the page doesn't jump when it loads
        return <Skeleton className="h-52 w-full rounded-xl sm:h-44"/>
    }

    //404 return
    if(profile.status === "error"){
        if(profile.error.status === 404){
            return(
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <UserCircleIcon />
                        </EmptyMedia>
                        <EmptyTitle>User not found</EmptyTitle>
                        <EmptyDescription>{profile.error.message}</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button asChild>
                            <Link to="/">Search again</Link>
                        </Button>
                    </EmptyContent>
                </Empty>
            )
        }
        
        //unknown error return
        return(
            <Alert variant="destructive">
                <WarningCircleIcon />
                <AlertTitle>Couldn't load this user</AlertTitle>
                <AlertDescription>{errorMessage(profile.error)}</AlertDescription>
            </Alert>
        )
    }
    
    //success
    return(
        <div className="flex flex-col gap-8">
            <ProfileHeader profile={profile.data}/>
            <GamesSection state={games} achievements={achievements}/>
        </div>
    )
}

interface GamesSectionProps{
    state: ApiState<UserGameResponse>;
    achievements: ApiState<UserAchievementsResponse>;
}

function GamesSection({state, achievements}: GamesSectionProps){
    if(state.status === "loading"){
        return(
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[0, 1, 2, 3].map((index)=><Skeleton key={index} className="h-24 rounded-xl"/>)}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[0, 1, 2, 3].map((index)=><Skeleton key={index} className="h-72 rounded-xl"/>)}
                </div>
            </div>
        )
    }

    if(state.status === "error"){
        if(state.error.status === 403){
            return(
                <Alert>
                    <LockIcon />
                    <AlertTitle>Game details are private</AlertTitle>
                    <AlertDescription>
                        This user's library is hidden. They can make it public in Steam's privacy settings.
                    </AlertDescription>
                </Alert>
            )
        }

        return(
            <Alert variant="destructive">
                <WarningCircleIcon />
                <AlertTitle>Couldn't load games</AlertTitle>
                <AlertDescription>{errorMessage(state.error)}</AlertDescription>
            </Alert>
        )
    }

    const {games, steamId} = state.data
    const stats = computeStats(state.data)
    //games arrive sorted most played first, so the first few are the highlights
    const topGames = games.slice(0, TOP_GAMES_COUNT)
    const otherGames = games.slice(TOP_GAMES_COUNT)

    return(
        <div className="flex flex-col gap-8">
            <StatCards stats={stats}/>

            {games.length === 0 && (
                <Empty>
                    <EmptyHeader>
                        <EmptyTitle>No games yet</EmptyTitle>
                        <EmptyDescription>This library is empty</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            {topGames.length > 0 && <TopGames games={topGames} steamId={steamId} achievements={achievements}/>}

            {otherGames.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="font-heading text-lg font-semibold">Rest of the library</h2>
                    <GamesTable games={otherGames} steamId={steamId}/>
                </section>
            )}
        </div>
    )
}
