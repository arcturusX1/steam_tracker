import{ Avatar, AvatarImage, AvatarFallback} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowSquareOutIcon } from "@phosphor-icons/react"
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

export default function ProfileHeader({profile}: UserProfile){
    return (
        <div className="flex items-center gap-4">
            <Avatar className="size-16" src={profile.avatar} alt={profile.displayName}"'s avatar"/>
            <div className="flex min-w-0 flex-col gap-1">
                <div className="flex min-w-0 items-center gap-2">
                    <h1 className="truncate font-heading text-2xl font-semibold">
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                            <link rel="stylesheet" href="" className="a" />
                        </p>
                    </h1>
                </div>
            </div>
        </div>
    )
}