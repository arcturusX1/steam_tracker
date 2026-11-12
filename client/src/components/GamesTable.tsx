import { useState } from "react";
import { Link } from "react-router";
import { Table, TableHeader, 
    TableBody, TableRow, 
    TableHead, TableCell} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Card, CardContent } from "@/components/ui/card";
import { MagnifyingGlassIcon, ListIcon, SquaresFourIcon } from "@phosphor-icons/react";
import GameArt from "@/components/GameArt";
import { formatHours } from "@/lib/dateFormat";
import { gamePath } from "@/lib/paths";
import type { UserGame } from "@/types/api";


type SortKey = "playtime" | "recent" | "name"
type ViewMode = "list" | "grid"

interface GamesTableProps{
    games: UserGame[]
    steamId: string
}

const SORT_OPTIONS: {value: SortKey, label: string}[] = [{"value": "playtime", "label": "Most played"}, 
    {"value": "recent", "label": "Recent"},
    {"value": "name", "label": "A-Z"}]

//this function is checking for a valid sort key (e.g. recent, name)
//.some() goes through all the elements in SORT_OPTIONS and returns true if value match is found,
//returns false otherwise
//"value is SortKey" tells the caller that the key *is* a SortKey when true (type predicate)
function isSortKey(value: string): value is SortKey{
    return SORT_OPTIONS.some((option)=>option.value===value)
}

function isViewMode(value: string | null): value is ViewMode{
    return value === "list" || value === "grid"
}

//the chosen view is saved in the browser, so it survives visiting a game page and coming back
const VIEW_STORAGE_KEY = "steam-tracker:library-view"

function loadViewMode(): ViewMode{
    const saved = localStorage.getItem(VIEW_STORAGE_KEY)
    return isViewMode(saved) ? saved : "list"
}

function sortGames(games: UserGame[], key:SortKey): UserGame[]{
    switch(key){
        case("playtime"):
            return games.toSorted((a ,b)=>b.playtimeHours - a.playtimeHours)
        case("recent"):
            // left side of || checks recent playtime. if equal, checks most playtime on the right
            return games.toSorted((a,b)=>b.recentHours-a.recentHours || b.playtimeHours - a.playtimeHours)
        case("name"):
            return games.toSorted((a,b)=>a.name.localeCompare(b.name))
    }
}

export default function GamesTable({games, steamId}: GamesTableProps){
    const [query, setQuery] = useState("")
    const [sortKey, setSortKey] = useState<SortKey>("playtime")
    //passing the function (not calling it) means localStorage is only read on the first render
    const [view, setView] = useState<ViewMode>(loadViewMode)

    const searchTerm = query.toLowerCase().trim()
    const filtered = games.filter((game)=>game.name.toLowerCase().includes(searchTerm))
    const visibleGames= sortGames(filtered, sortKey)

    if(games.length===0){
        return(
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>No Games yet</EmptyTitle>
                    <EmptyDescription>This library is empty</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <InputGroup className="sm:max-w-xs">
                    <InputGroupAddon>
                        <MagnifyingGlassIcon/>
                    </InputGroupAddon>
                    
                    <InputGroupInput value={query} 
                    onChange={(e)=>setQuery(e.target.value)} 
                    placeholder="Filter games"
                    aria-label="Filter games"/>
                </InputGroup>
                    
                <div className="flex flex-wrap items-center gap-2">
                    <ToggleGroup type="single" variant="outline"
                    size="sm" value={sortKey}
                    onValueChange={(value)=>{if (isSortKey(value)){setSortKey(value)}}}>
                    {SORT_OPTIONS.map((option)=>
                        <ToggleGroupItem key={option.value} value={option.value}>{option.label}</ToggleGroupItem>
                        )
                    }
                    </ToggleGroup>

                    <ToggleGroup type="single" variant="outline"
                    size="sm" value={view} aria-label="Library view"
                    onValueChange={(value)=>{
                        if (isViewMode(value)){
                            setView(value)
                            localStorage.setItem(VIEW_STORAGE_KEY, value)
                        }
                    }}>
                        <ToggleGroupItem value="list" aria-label="List view"><ListIcon/></ToggleGroupItem>
                        <ToggleGroupItem value="grid" aria-label="Grid view"><SquaresFourIcon/></ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">
                Showing {visibleGames.length} of {games.length} games
            </p>
            {visibleGames.length === 0 ? (
                <Empty>
                    <EmptyHeader>
                        <EmptyTitle>No matches</EmptyTitle>
                        <EmptyDescription>No games match "{query}".</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : view === "grid" ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {visibleGames.map((game) => (
                        <Link key={game.appId} to={gamePath(steamId, game.appId)}
                        className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <Card size="sm" className="h-full gap-3 pt-0 transition-shadow group-hover:ring-foreground/30">
                                <GameArt src={game.headerUrl} alt=""/>
                                <CardContent className="flex flex-col gap-0.5">
                                    <span className="truncate font-medium underline-offset-4 group-hover:underline">{game.name}</span>
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                        {formatHours(game.playtimeHours)}
                                        {game.recentHours > 0 && ` · ${formatHours(game.recentHours)} recently`}
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Game</TableHead>
                            <TableHead className="text-right">Hours</TableHead>
                            <TableHead className="hidden text-right sm:table-cell">Last 2 weeks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleGames.map((game) => (
                            <TableRow key={game.appId}>
                                <TableCell>
                                    <div className="flex max-w-64 items-center gap-3">
                                        {game.iconUrl ? (
                                            <img
                                                src={game.iconUrl}
                                                alt=""
                                                loading="lazy"
                                                className="size-8 shrink-0 rounded-sm"
                                            />
                                        ) : (
                                            <div className="size-8 shrink-0 rounded-sm bg-muted" />
                                        )}
                                        <Link to={gamePath(steamId, game.appId)} className="truncate font-medium underline-offset-4 hover:underline">
                                            {game.name}
                                        </Link>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatHours(game.playtimeHours)}
                                </TableCell>
                                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                    {game.recentHours > 0 ? formatHours(game.recentHours) : "—"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )

}