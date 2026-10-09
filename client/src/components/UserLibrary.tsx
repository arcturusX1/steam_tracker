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
import { fetchUser, fetchUserGames, errorMessage } from "@/lib/api";
import type { ApiState } from "@/hooks/useApiData";
import type { UserGameResponse } from "@/types/api";
import { WarningCircleIcon, LockIcon, UserCircleIcon } from "@phosphor-icons/react";



interface UserLibraryProps{
    input: string;
}

export default function UserLibrary({input}:UserLibraryProps){
    const profile = useApiData(input, fetchUser)
    const games = useApiData(input, fetchUserGames)
    
    //loading return
    if(profile.status === "loading"){
    return(
        <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full"/>
            <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-48"/>
                <Skeleton className="h-4 w-32"/>
            </div>
        </div>
        )
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
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="font-heading text-2xl font-semibold">{profile.data.displayName}</h1>
                <p className="text-sm text-muted-foreground">{profile.data.steamId}</p>
            </div>
            <GamesSection state={games}/>
        </div>
    )
}

interface GamesSectionProps{
    state: ApiState<UserGameResponse>;
}

function GamesSection({state}: GamesSectionProps){
    if(state.status === "loading"){
        return <Skeleton className="h-32 w-full"/>
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

    return(
        <p className="text-muted-foreground">
            {state.data.gameCount} games, {state.data.totalPlaytimeHours} hours played
        </p>
    )
}
