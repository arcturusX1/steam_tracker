import { useParams } from "react-router"
import {
    Card, 
    CardDescription,
    CardHeader,
    CardTitle,
}from "@/components/ui/card"





export default function UserPage(){
    const {input} = useParams<"input">() //builds the input object when using {} directly

    if(!input){
        return <p className="text-muted-foreground">No User Entered</p>
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Library of {input}</CardTitle>
                <CardDescription>Load Profile</CardDescription>
            </CardHeader>
        </Card>
    )
}