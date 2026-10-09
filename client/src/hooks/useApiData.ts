import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";

export type ApiState<T> =
    | { status: "loading" }
    | { status: "error"; error: ApiError }
    | { status: "success"; data: T };

export function useApiData<T>(input: string, fetchFn: (input: string, signal: AbortSignal) => Promise<T>): ApiState<T>{
    const [state, setState] = useState<ApiState<T>>({status: "loading"})

    useEffect(()=>{
        const controller = new AbortController()

        fetchFn(input, controller.signal)
            .then((data)=>{
                setState({status: "success", data})
            })
            .catch((error: unknown)=>{
                //a cancelled request (unmount, or a new input) isn't a failure
                if(controller.signal.aborted){
                    return
                }
                const apiError = error instanceof ApiError ? error : new ApiError(0, "Something went wrong")
                setState({status: "error", error: apiError})
            })

        //cleanup: runs on unmount and before the effect re-runs, cancelling the old request
        return () => {
            controller.abort()
        }
    }, [input, fetchFn])

    return state
}