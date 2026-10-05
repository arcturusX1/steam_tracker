import { useState, type SubmitEvent } from "react"
import { useNavigate } from "react-router"
import {MagnifyingGlassIcon} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import{
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"

import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"

const EXAMPLES = ["gabelogannewell", "ArcturusX1"]

export default function SearchPage(){
    const [query, setQuery] = useState("")
    const navigate = useNavigate()

    const trimmed = query.trim()

    function goToUser(input: string){
        navigate(`/user/${encodeURIComponent(input)}`)
    }

    function handleSubmit(event: SubmitEvent<HTMLFormElement>){
        event.preventDefault()
        if(!trimmed) return
        goToUser(trimmed)
    }
    
    return (
        <div className="flex justify-center pt-16">
            <Card className="w-full max-w-lg">
                
                <CardHeader>
                    <CardTitle>Search a Steam User</CardTitle>
                    <CardDescription>
                        View profile, library and more
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Field>
                            <FieldLabel htmlFor="steam-input">Steam User</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="steam-input"
                                    value={query}//gets current value of query 
                                    onChange={(event)=>setQuery(event.target.value)}//changes value of query on keystroke event
                                    placeholder="gabelogannewell"
                                    autoFocus/>
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton type="submit" disabled={!trimmed} /*button disabled if query is empty string */>
                                        <MagnifyingGlassIcon data-icon="inline-start"/>
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                            <FieldDescription>
                                Custom URL, profile URL, SteamID or Display Names are not supported
                            </FieldDescription>
                        </Field>
                    </form>
                </CardContent>

                <CardFooter className="felx flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Try:</span>
                    {EXAMPLES.map((name)=>( //get names from EXAMPLES and turn each into a button
                        <Button
                            key={name}
                            variant="outline"
                            size="sm"
                            onClick={()=>goToUser(name)} /*button disabled if query is empty string */> 
                            {name}
                        </Button>
                    ))}
                </CardFooter>
            </Card>
        </div>
    )
}