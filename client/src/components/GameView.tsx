import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
    EmptyMedia } from "@/components/ui/empty";
import { ArrowLeftIcon, ArrowSquareOutIcon, GameControllerIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useApiData } from "@/hooks/useApiData";
import { fetchGameDetails, errorMessage } from "@/lib/api";

interface GameViewProps{
    appId: string;
    input: string;
}

interface DetailItemProps{
    label: string;
    value: string | null;
}

//one label/value pair in the details list. returning null renders nothing, so missing values just disappear
function DetailItem({label, value}: DetailItemProps){
    if(value === null){
        return null
    }
    return(
        <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    )
}

//an empty list becomes null, so DetailItem hides it
function joinList(items: string[]): string | null{
    return items.length > 0 ? items.join(", ") : null
}

export default function GameView({appId, input}: GameViewProps){
    const game = useApiData(appId, fetchGameDetails)

    //useParams decoded input, so encode it again before putting it back into a URL
    const libraryPath = `/user/${encodeURIComponent(input)}`

    //loading return: same layout as the success state, so nothing jumps when the data arrives
    if(game.status === "loading"){
        return(
            <div className="flex flex-col gap-6 md:flex-row">
                <Skeleton className="aspect-[460/215] w-full rounded-lg md:w-96 md:shrink-0"/>
                <div className="flex flex-1 flex-col gap-3">
                    <Skeleton className="h-8 w-64"/>
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-3/4"/>
                </div>
            </div>
        )
    }

    if(game.status === "error"){
        //404 return: not on the store (includes delisted games)
        if(game.error.status === 404){
            return(
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <GameControllerIcon />
                        </EmptyMedia>
                        <EmptyTitle>Game not found</EmptyTitle>
                        <EmptyDescription>{game.error.message}</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button asChild>
                            <Link to={libraryPath}>Back to library</Link>
                        </Button>
                    </EmptyContent>
                </Empty>
            )
        }

        //unknown error return
        return(
            <Alert variant="destructive">
                <WarningCircleIcon />
                <AlertTitle>Couldn't load this game</AlertTitle>
                <AlertDescription>{errorMessage(game.error)}</AlertDescription>
            </Alert>
        )
    }

    //success: work out every display value first, so each one is a string or null (no stray 0 in the JSX)
    const details = game.data
    const released = details.comingSoon ? "Coming soon" : details.releaseDate
    const metacritic = details.metacriticScore !== null ? String(details.metacriticScore) : null
    const recommendations = details.recommendations !== null ? details.recommendations.toLocaleString() : null
    const achievements = details.achievementCount > 0 ? String(details.achievementCount) : null

    return(
        <div className="flex flex-col gap-6">
            <Button variant="ghost" size="sm" asChild className="self-start">
                <Link to={libraryPath}>
                    <ArrowLeftIcon data-icon="inline-start"/>
                    Back to library
                </Link>
            </Button>

            <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <img
                    src={details.headerImage}
                    alt={details.name}
                    className="aspect-[460/215] w-full rounded-lg object-cover md:w-96 md:shrink-0"
                />

                <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="font-heading text-3xl font-semibold">{details.name}</h1>
                        {details.appType !== "game" && <Badge variant="outline" className="uppercase">{details.appType}</Badge>}
                        {details.isFree && <Badge variant="secondary">Free to play</Badge>}
                    </div>

                    <p className="text-muted-foreground">{details.shortDescription}</p>

                    {details.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {details.genres.map((genre)=>(
                                <Badge key={genre} variant="secondary">{genre}</Badge>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={details.storeUrl} target="_blank" rel="noopener noreferrer">
                                View on Steam
                                <ArrowSquareOutIcon data-icon="inline-end"/>
                            </a>
                        </Button>
                        {details.website !== null && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={details.website} target="_blank" rel="noopener noreferrer">
                                    Official website
                                    <ArrowSquareOutIcon data-icon="inline-end"/>
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DetailItem label="Developer" value={joinList(details.developers)}/>
                        <DetailItem label="Publisher" value={joinList(details.publishers)}/>
                        <DetailItem label="Released" value={released}/>
                        <DetailItem label="Platforms" value={joinList(details.platforms)}/>
                        <DetailItem label="Metacritic" value={metacritic}/>
                        <DetailItem label="Recommendations" value={recommendations}/>
                        <DetailItem label="Achievements" value={achievements}/>
                    </dl>
                </CardContent>
            </Card>
        </div>
    )
}
