import { resolveSteamId, getPlayerSummary, getOwnedGames } from "./services/steam.ts";

const id = await resolveSteamId("Arcturus");
console.log("SteamID:", id);

const player = await getPlayerSummary(id);
console.log("Name:", player.personaname, "| Public:", player.communityvisibilitystate === 3);

const games = await getOwnedGames(id);
console.log(games === null ? "Games: private" : `Games: ${games.length}`);
