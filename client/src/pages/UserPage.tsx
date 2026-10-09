import { useParams } from "react-router"
import UserLibrary from "@/components/UserLibrary"

export default function UserPage(){
    const {input} = useParams<"input">() //builds the input object when using {} directly

    if(!input){
        return <p className="text-muted-foreground">No User Entered</p>
    }
    return (
        <UserLibrary input={input} key={input}/>
    )
}