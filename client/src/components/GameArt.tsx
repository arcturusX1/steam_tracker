import { useState } from "react";
import { GameControllerIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface GameArtProps{
    src: string;
    alt: string;
    className?: string;
}

//a game's header image, in Steam's 460x215 shape. a few games have no header image,
//so a failed load swaps in a placeholder instead of showing a broken image
export default function GameArt({src, alt, className}: GameArtProps){
    const [failed, setFailed] = useState(false)

    if(failed){
        return(
            <div className={cn("flex aspect-[460/215] w-full items-center justify-center bg-muted text-muted-foreground", className)}>
                <GameControllerIcon className="size-8"/>
            </div>
        )
    }

    return(
        <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={()=>setFailed(true)}
            className={cn("aspect-[460/215] w-full object-cover", className)}
        />
    )
}
