const fullDate = new Intl.DateTimeFormat(undefined, {dateStyle: "medium"})
const monthAndYear = new Intl.DateTimeFormat(undefined, {year: "numeric", month: "short"})


export function formatHours(hours: number): string{
    const formattedHours = hours.toLocaleString(undefined, {maximumFractionDigits: 1}) + " h"
    return formattedHours
}

export function formatDate(iso: string | null): string{
    if(iso === null){
        return "Never"
    }
    return fullDate.format(new Date(iso))
}

export function formatMonthYear(iso: string|null): string|null{
    if(iso===null){
        return null
    }
    return monthAndYear.format(new Date(iso))
}
