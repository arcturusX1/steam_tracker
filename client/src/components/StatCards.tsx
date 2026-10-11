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
            value={formatHours(stats.totalHours)} 
            hint={stats.recentHours > 0? `Recent playtime: ${formatHours(stats.recentHours)}`: undefined}/>
            
            <StatCard label="Games Owned"
            value={stats.gameCount.toLocaleString()}
            />

            <StatCard label="Most Played"
            //mostPlayed is null for an empty library: 
            // ?. gives undefined instead of crashing on .name, 
            // ?? swaps undefined for "-"
            value={stats.mostPlayed?.name ?? "-"}
            hint={stats.mostPlayed? formatHours(stats.mostPlayed.playtimeHours): undefined}/>


        </div>
    )
}