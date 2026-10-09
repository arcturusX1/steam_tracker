import type { UserProfile, UserGameResponse } from "@/types/api";
const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error{
    status: number

    constructor(status: number, message: string){
        super(message);
        this.status = status;
        this.name = "ApiError"
    }
}

async function apiGet<T>(path: string, signal:AbortSignal): Promise<T>{
    let response: Response
    try{
        response = await fetch(API_URL+path, {signal}) //base url + path from function
    }catch(error){
        if (signal.aborted){
            throw error
        }
        throw new ApiError(0, "Can't reach server")
    }
    
    if (!response.ok){
        const body: unknown = await response.json().catch(()=>null) //checking if the body is an html or something else
    
        const message = 
            typeof body === "object" &&
            body!= null &&
            "message" in body &&
            typeof body.message === "string"? body.message : `Request Failed (${response.status})`
        throw new ApiError(response.status, message)
    }

    return response.json()
}

export async function fetchUser(input: string, signal: AbortSignal): Promise<UserProfile>{
    return await apiGet<UserProfile>("/users/" + encodeURIComponent(input), signal)
}

export async function fetchUserGames(input: string, signal: AbortSignal): Promise<UserGameResponse>{
    return await apiGet<UserGameResponse>("/users/" + encodeURIComponent(input) + "/games", signal)
}

export function errorMessage(error: ApiError){
    switch (error.status){
    case (0):
    case (400):
        return `${error.message}: ${error.status}`    
    case (404):
        return `${error.message}: ${error.status}`
    case (403):
        return `This profile's games are private: ${error.status}`
    case (429):
        return `Too many requests, try again later: ${error.status}`
    case (502):
        return `Steam is not available: ${error.status}`
    default:
        return `Something went wrong: ${error.status}`
    }
}