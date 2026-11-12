import{ Avatar, AvatarImage, AvatarFallback} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowSquareOutIcon, CalendarBlankIcon } from "@phosphor-icons/react"
import { formatMonthYear } from "@/lib/dateFormat"
import type { UserProfile } from "@/types/api"

function statusVariant(status: string): "default" | "secondary" | "outline"{
    switch(status){
        case "online":
        case "looking to play":
        case "looking to trade":
            return "default"

        case "away":
        case "busy":
        case "snooze":
            return "secondary"
        default:
            return "outline"
    }
}
interface ProfileHeaderProps{
    profile: UserProfile
}

export default function ProfileHeader({profile}: ProfileHeaderProps){
    const memberSince = formatMonthYear(profile.createdAt)
    return (
        <Card className="gap-0 py-0">
            {/* decorative banner: the avatar below overlaps its bottom edge */}
            <div className="h-24 bg-linear-to-r from-primary/50 via-chart-3/25 to-transparent sm:h-28"/>

            <CardContent className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end">
                <Avatar className="-mt-12 size-24 ring-4 ring-card">
                    <AvatarImage src={profile.avatar} alt={`${profile.displayName}'s avatar`}/>
                    <AvatarFallback className="text-2xl">{profile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h1 className="truncate font-heading text-2xl font-semibold sm:text-3xl">
                            {profile.displayName}
                        </h1>
                        <Badge variant={statusVariant(profile.status)} className="capitalize">{profile.status}</Badge>
                        {!profile.isPublic && <Badge variant="outline">Private profile</Badge>}
                    </div>

                    {memberSince && (
                        <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <CalendarBlankIcon className="size-4"/>
                            Member since {memberSince}
                        </p>
                    )}
                </div>

                <Button variant="outline" size="sm" asChild className="self-start sm:self-end">
                    <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer">
                        Steam profile
                        <ArrowSquareOutIcon data-icon="inline-end"/>
                    </a>
                </Button>
            </CardContent>
        </Card>
    )
}
