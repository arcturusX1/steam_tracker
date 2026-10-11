import { useState } from "react";
import { Table, TableHeader, 
    TableBody, TableRow, 
    TableHead, TableCell} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { formatHours, formatDate } from "@/lib/dateFormat";
import type { UserGame } from "@/types/api";

type SortKey = "playtime" | "recent" | "lastPlayed" | "name"

const SORT_OPTIONS: {value: SortKey, label: string}[] = [{"value": "playtime", "label": "Most played"}, 
    {"value": "recent", "label": "Recent"}, 
    {"value": "lastPlayed", "label": "Last Played"},
    {"value": "name", "label": "A-Z"}]

