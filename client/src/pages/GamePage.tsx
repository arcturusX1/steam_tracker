import { useParams } from "react-router";
import GameView from "@/components/GameView"

export default function GamePage(){
    const {input, appId} = useParams<"input" | "appId">()

    if(!input || !appId){
        return <p className="text-muted-foreground">No game selected</p>
    }
    return (
        <GameView appId={appId} input={input} key={appId}/>
    )
}
