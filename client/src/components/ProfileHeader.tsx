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
interface ProfileHeaderProps{
    profile: UserProfile
}

export default function ProfileHeader({profile}: ProfileHeaderProps){
    const memberSince = formatMonthYear(profile.createdAt)
    return (
        <div className="flex items-center gap-4">
            
            <Avatar className="size-16">
                <AvatarImage src={profile.avatar} alt={`${profile.displayName}'s profile`}/>
                <AvatarFallback>{profile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-col gap-1">
                <div className="flex min-w-0 items-center gap-2">
                    <h1 className="truncate font-heading text-2xl font-semibold"> 
                        {profile.displayName}
                    </h1>

                    <Badge variant = {statusVariant(profile.status)}>{profile.status}</Badge>
                    {!profile.isPublic && <Badge variant="outline">Private Profile</Badge>}
                </div>

                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {memberSince && <span>Member since {memberSince}</span>}
                    <a
                        href={profile.profileUrl}
                        target="_blank"
                        rel="nonreferrer"
                        className="inline-flex items-center gap-1 underline-offset-4 hover:text-foreground hover:underline">
                    Steam Profile</a>
                    <ArrowSquareOutIcon className="size-3.5"/>
                </p>
            </div>
        </div>
    )
}