# Steam Tracker

A MERN app that looks up Steam users and tracks their profile and game library. It has an Express + TypeScript API in `server/` and a React 19 + Vite client in `client/`. The client is still the untouched Vite template; all work so far has been on the server.

## How to work in this repo (learning project)

The owner is learning by building this, and writes the code themselves.

- **Don't edit source files unless asked.** Review their files, run the typecheck and curl, and point out problems with file and line references.
- **Default to prose:** describe what each function or file needs to do (inputs, outputs, what it calls, edge cases, status codes) without code blocks. Write code **only when explicitly asked** ("give me the code", "write out the code"), and explain it line by line when you do.
- "Describe a step" means numbered, concrete actions, not concepts.
- When asked, step guides are saved to `server/docs/` as markdown.

## Commands (run from `server/`)

| Command | What it does |
|---|---|
| `npm run dev` | `node --env-file=.env --watch index.ts` (Node runs `.ts` directly via type stripping; no build step) |
| `npm start` | The same, without watch |
| `npm run typecheck` | `tsc --noEmit`. This is the only type checking; Node itself does not check types. |

- `--watch` does not reload `.env`. Restart after changing environment variables.
- `nodemon` is in the dependencies but unused.
- The server runs on `PORT` (5000). The client dev server (`npm run dev` in `client/`) runs on 5173.

## TypeScript constraints (`server/tsconfig.json`)

- **Relative imports must include `.ts`** (`./routes/usersRouter.ts`). This is allowed by `rewriteRelativeImportExtensions`.
- **`verbatimModuleSyntax`:** type-only imports must use `import type` or an inline `type`.
- **`erasableSyntaxOnly`:** no `enum`, no namespaces, and no constructor parameter properties (`constructor(public x)`). Declare class fields explicitly.
- ESM (`"type": "module"`), so top-level `await` is used in `index.ts`.
- **No `noUncheckedIndexedAccess`**, so `arr[i]` is typed as non-undefined.

## Environment (`server/.env`, loaded with `--env-file`; dotenv is installed but unused)

| Variable | Notes |
|---|---|
| `STEAM_API_KEY` | Added to every Steam request by `steamGet`. **Never log axios errors whole**: their URL contains the key. |
| `STEAM_API_URL` | `https://api.steampowered.com` |
| `MONGODB_URI` | An Atlas `mongodb+srv` URI with the database name in the path |
| `PORT` | |
| `CLIENT_URL` | `http://localhost:5173`, used as the CORS origin. No trailing slash. |

`MONGODB_USERNAME` and `MONGODB_PASSWORD` are still in `.env.example`, but no code reads them.

## Server layout

```
server/
├── index.ts                    # app setup, middleware order, connect DB then listen, SIGINT disconnect
├── config/mongooseConnector.ts # connectToMongoDB / disconnectFromMongoDB (5s serverSelectionTimeoutMS)
├── routes/
│   ├── healthRouter.ts         # GET /health → { status, timestamp }
│   └── usersRouter.ts          # GET /:input, GET /:input/games
├── controllers/userController.ts  # paramsValidator (400), getUser, getUserGames (403 if private)
├── services/
│   ├── steamService.ts         # all Steam HTTP calls; steamGet<T> is private
│   ├── userService.ts          # cache layer (Step 6, in progress)
│   ├── types/steamResponseTypes.ts  # raw Steam response shapes
│   └── utils/
│       ├── HttpError.ts        # Error subclass with `status`
│       └── mappers.ts          # toProfile, toGame, toHours; UserProfile, UserGame interfaces
├── models/
│   ├── User.ts                 # IUser + User model (collection: users)
│   └── VanityName.ts           # IVanity + VanityName model (TTL 7d on createdAt)
├── middleware/
│   ├── notFound.ts             # JSON 404 using req.originalUrl
│   ├── errorHandler.ts         # 4-arg handler; hides messages on 500; headersSent → next(err)
│   └── rateLimiter.ts          # apiLimiter (300/15min), steamLimiter (20/min); draft-8 headers; JSON message
└── docs/                       # step guides written for the owner (step-4, step-6)
```

### Middleware and route order in `index.ts` (order matters)

1. `helmet()`, `cors({ origin: CLIENT_URL })`, `morgan("dev")`, `express.json()`
2. `/api`: `healthRouter`, **before** any limiter, so health is never rate-limited
3. `/api`: `apiLimiter`
4. `/api/users`: `steamLimiter`, then `userRouter`
5. `notFound`, then `errorHandler`, last

## Conventions

- **Layers:**
  - Routes only map URLs to controllers.
  - Controllers read `req`, call services, map the results, and call `res.json` (without `return`).
  - Services never touch `req` or `res`.
- **Errors:** throw `HttpError(status, message)`. Express 5 forwards async throws to `errorHandler`, so there is **no try/catch in controllers**. Steam failures become 502, except a Steam 429, which stays 429.
- **Status codes:** 400 for bad input, 404 for an unknown user, 403 for private game details, 429 when rate-limited, 502 when Steam fails.
- **Response shape:**
  - Always JSON.
  - Errors are `{ message }`, including the rate limiter's.
  - Success responses use our mapped camelCase shapes, never Steam's raw objects.
- **Naming:**
  - Our code says **"user"** (`User`, `IUser`, `userService`, `userController`).
  - Anything describing Steam's API keeps **"player"** (`PlayerSummary`, `getPlayerSummary`); a raw Steam summary variable is `player`.
  - Interfaces for Mongoose documents are prefixed `I`.
- **Identity terms (each variable name has exactly one meaning):**

  | Name | Meaning |
  |---|---|
  | `input` | Raw user text: a SteamID, vanity name, or profile URL |
  | `steamId` | Always the 17-digit SteamID64 |
  | `vanityName` | Always the custom-URL name (`/id/<vanityName>`), lowercased in the DB |
  | `displayName` | Always Steam's `personaname`. It's not unique and **can't be looked up**. |

  - `parseIdOrVanity(input)` → `{ steamId } | { vanityName }`. It's pure, in `steamService`.
  - `lookupVanityName(vanityName)` → `steamId`. It calls ResolveVanityURL only, in `steamService`.
  - `resolveSteamIdCached(input)` → `steamId`. It parses, checks the `VanityName` cache, and looks up on a miss, in `userService`.
- **SteamIDs are always strings.** They're 17 digits, which is too large for a JS number.
- **Unit conversions:**
  - Steam playtime is in minutes; it's converted to hours rounded to one decimal place (`toHours`).
  - Steam timestamps are Unix **seconds**; they're converted to ISO strings or `null` (`toIsoDate`).
- **Private profiles:** GetOwnedGames returns `response: {}`. `getOwnedGames` returns `null` for this, which the controller turns into a 403. `null` (private or unknown) is kept distinct from `[]` (no games).
- **Exports:** routers, middleware, and models use default exports; services, mappers, and limiters use named exports.

## Steam endpoints used

| Endpoint | Version | Notes |
|---|---|---|
| `ISteamUser/ResolveVanityURL` | v1 | `success === 1` means found; 42 means no match |
| `ISteamUser/GetPlayerSummaries` | v2 | `steamids` param; an unknown ID gives an empty `players` array |
| `IPlayerService/GetOwnedGames` | v1 | `include_appinfo=1`, `include_played_free_games=1` |

- Game icon URL: `https://media.steampowered.com/steamcommunity/public/images/apps/{appid}/{img_icon_url}.jpg`
- Quota: about 100,000 calls per day per key, which is why the Step 6 cache exists.

## Progress

| Step | Status |
|---|---|
| 1. Express setup, middleware, health route, 404 and error handlers | Done |
| 2. MongoDB connection | Done |
| 3. Steam service layer | Done |
| 4. Routes and controllers | Done |
| 5. Rate limiting | Done |
| 6. Caching in MongoDB | **In progress.** Guide: `server/docs/step-6-caching-models.md` |
| 7. React client | Not started |
| Later | Steam OpenID login (passport-steam), deployment (`trust proxy` for rate limiting behind a host's proxy) |

### Step 6 status

- **Done:**
  - Mappers moved to `services/utils/mappers.ts`, with exported interfaces and return types.
  - `User` and `VanityName` models.
  - `resolveSteamId` split into `parseIdOrVanity` and `lookupVanityName`.
  - `resolveSteamIdCached` implemented in `userService`, and the controllers use it.
- **To do:**
  - `userService.ts`: `isFresh`, `getProfileCached`, `getGamesCached`. Write with `updateOne` + `$set` + `upsert`, and read with `.lean()`.
  - Point the controllers' profile and games calls at `userService`. They still call `getPlayerSummary` and `getOwnedGames` directly.
  - The total-playtime decision: sum the rounded hours, or add `playtimeMinutes` to `UserGame`, the mapper, and the schema.
  - The Part F tests.
  - **`MONGODB_URI` has no database name.** Everything goes into the `test` database (it was empty as of 2026-10-03). Add `/steam_tracker` before the `?`.

## Known gotchas

- **Atlas IP access list:** the owner's ISP rotates public IPs (seen: `45.248.151.16`, `.29`). The access list uses `45.248.151.0/24`.
  - An Atlas rejection shows up as `MongooseServerSelectionError` / `SSL alert number 80`, not as an auth error.
  - `hostname -i` in WSL gives a local address, not the public IP.
- **TTL index:** MongoDB won't update an existing TTL index when `expires` changes in code. Drop the index in Atlas and restart.
- **Unknown options are ignored:** Mongoose silently ignores misspelled schema options (for example, `requried`), and TypeScript doesn't catch them either.
- **Full profile URLs** as `:input` must be URL-encoded by the client (`encodeURIComponent`).
- **Rate-limit counters** are in memory and reset when the server restarts.
