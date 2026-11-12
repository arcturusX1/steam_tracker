import {Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import { formatHours } from "@/lib/dateFormat"
import type { LibraryStats } from "@/lib/stats"

interface StatCardProps{
    label: string;
    value: string;
    hint?: string 
}

interface StatCardsProps{
    stats: LibraryStats
}

//individual cards
function StatCard({label, value, hint}: StatCardProps){
    return (
        <Card className="min-w-0">
            <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="truncate text-2xl tabular-nums">{value}</CardTitle>
            </CardHeader>
            {hint && <CardContent className="text-sm text-muted-foreground">{hint}</CardContent>}
        </Card>
    )
}

//container for cards. take each stat and turn it into a StatCard
export default function StatCards({stats}: StatCardsProps){
    return(
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Playtime"
            value={formatHours(stats.totalHours)}/>

            <StatCard label="Games Owned"
            value={stats.gameCount.toLocaleString()}
            />

            {/* the most played game now has its own section (TopGames), so this slot shows how much of the library has been played */}
            <StatCard label="Library Played"
            value={`${stats.playedPercent}%`}
            hint={stats.unplayedCount > 0 ? `${stats.unplayedCount.toLocaleString()} never played` : undefined}/>

            <StatCard label="Last 2 Weeks"
            value={formatHours(stats.recentHours)}
            hint={stats.recentGames.length > 0 ? `Across ${stats.recentGames.length} ${stats.recentGames.length === 1 ? "game" : "games"}` : "Nothing played recently"}/>

        </div>
    )
}