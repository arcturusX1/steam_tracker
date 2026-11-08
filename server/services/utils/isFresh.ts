export function isFresh(fetchedAt: Date | null | undefined, maxAge: number): boolean{
    if(!fetchedAt){
        return false;
    }
    const current = Date.now();
    const age = current - fetchedAt.getTime();
    return age < maxAge;
}