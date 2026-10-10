# Steam Tracker

A MERN app for looking up Steam users and exploring their profile and game library. Enter a SteamID, a custom URL name, or a profile URL. The app shows who the user is, how many games they own, and how much they've played.

- **`server/`** is an Express 5 + TypeScript API. It talks to the Steam Web API and caches results in MongoDB. It is complete for profiles and game libraries.
- **`client/`** is a React 19 + Vite frontend built with Tailwind CSS and shadcn/ui. It is still being built: search, routing, and data fetching work, and the full library view is in progress.

## Features

### Working now

**API**

- Looks up a user from a **SteamID64**, a **custom URL name** (`gabelogannewell`), or a **full profile URL** (`steamcommunity.com/id/...` or `steamcommunity.com/profiles/...`).
- Returns a user's profile: display name, avatar, online status, profile visibility, and account creation date.
- Returns a user's game library, sorted most-played first, with the game count and total hours played. Each game has its icon, total hours, hours in the last two weeks, and last-played date.
- Detects private game libraries and returns `403` instead of an empty list.
- Caches results in MongoDB to stay within Steam's daily quota (see [Caching](#caching)).
- Rate-limits requests: 300 per 15 minutes across the API, and 20 per minute for user lookups.
- Returns every error as JSON in the form `{ "message": "..." }`, with consistent status codes.
- Uses Helmet security headers, CORS restricted to the client's origin, and request logging.

**Client**

- A search page with example users to try.
- Routes for `/` (search), `/user/:input` (user page), and a not-found page for anything else.
- Data fetching through a reusable `useApiData` hook. It shows loading skeletons and cancels stale requests when you navigate away.
- A user page that shows the display name, SteamID, game count, and total hours.
- Error states for an unknown user, a private library, rate limiting, Steam being down, and the server being unreachable.

### In progress: library view (Step 7.3b)

- **Profile header:** avatar, colour-coded status badge, "member since" date, and a link to the Steam profile. *(currently being built)*
- **Stat cards:** total hours, game count, most played game, number of unplayed games, and the percentage of the library that's been played.
- **Games table:** every game with its icon, total hours, recent hours, and last-played date, with search and sorting.

### Planned

- **Game details (Step 7.4):** a Steam store endpoint on the server and a details view for each game.
- **Achievements:** per-game achievement progress.
- **Sign in with Steam:** Steam OpenID login using `passport-steam`.
- **Deployment:** hosting the API in the same region as the database, and enabling `trust proxy` so rate limiting works behind the host's proxy.

## Tech stack

| Part | Built with |
| --- | --- |
| Server | Node.js (runs TypeScript directly), Express 5, Mongoose 9, Axios, express-rate-limit, Helmet, CORS, Morgan |
| Database | MongoDB (local or Atlas) |
| Client | React 19, Vite 8, TypeScript 6, React Router, Tailwind CSS v4, shadcn/ui, Phosphor icons |
| External API | Steam Web API |

## Project structure

```text
steam_tracker/
├── server/
│   ├── index.ts              # App setup, middleware order, connects to MongoDB, then listens
│   ├── config/               # MongoDB connect and disconnect
│   ├── routes/               # /api/health and /api/users
│   ├── controllers/          # Validates input, calls services, and sends JSON
│   ├── services/
│   │   ├── steamService.ts   # All Steam Web API calls
│   │   ├── userService.ts    # Cache layer in front of steamService
│   │   ├── types/            # Raw Steam response shapes
│   │   └── utils/            # HttpError, plus mappers from Steam's shapes to ours
│   ├── models/               # User and VanityName Mongoose models
│   ├── middleware/           # Rate limiters, 404 handler, error handler
│   └── docs/                 # Step-by-step guides written during development
└── client/
    └── src/
        ├── pages/            # SearchPage, UserPage, NotFoundPage
        ├── components/       # Layout, UserLibrary, ProfileHeader, and shadcn/ui components in ui/
        ├── hooks/            # useApiData
        ├── lib/              # API client, date and hour formatting, cn helper
        └── types/            # Response types shared with the API
```

## Prerequisites

- **Node.js 22.18 or newer.** The server runs `.ts` files directly using Node's built-in type stripping, so there is no build step.
- npm
- MongoDB, either running locally (for example, in Docker) or as a free MongoDB Atlas cluster
- A [Steam Web API key](https://steamcommunity.com/dev/apikey)

## Setup

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure the server

Create `server/.env` from the example file:

```bash
cd server
cp .env.example .env
```

Fill in these values:

```env
STEAM_API_KEY=your_steam_api_key
STEAM_API_URL=https://api.steampowered.com
MONGODB_URI=mongodb://localhost:27017/steam_tracker
PORT=5000
CLIENT_URL=http://localhost:5173
```

| Variable | Notes |
| --- | --- |
| `STEAM_API_KEY` | Sent with every Steam request. Keep it secret. |
| `STEAM_API_URL` | The Steam Web API base URL. |
| `MONGODB_URI` | A local URI like the one above, or an Atlas URI (`mongodb+srv://<username>:<password>@<cluster-host>/steam_tracker`). Put the database name in the path. URL-encode special characters in the username or password. |
| `PORT` | The port the API listens on. If it isn't set, the server uses `3001`. |
| `CLIENT_URL` | The client's origin, used for CORS. Don't add a trailing slash. |

`.env.example` also lists `MONGODB_USERNAME` and `MONGODB_PASSWORD`. No code reads them, so you can leave them empty.

If you use Atlas, add your public IP address to the cluster's **IP Access List**. If your IP isn't on the list, the server fails to start with `MongooseServerSelectionError` and `SSL alert number 80`, not an authentication error.

### 3. Configure the client

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

The port must match the server's `PORT`. Every `VITE_` variable is bundled into the browser code, so never put a secret in this file.

## Running locally

Make sure MongoDB is running, then start the API:

```bash
cd server
npm run dev
```

Start the client in a second terminal:

```bash
cd client
npm run dev
```

Open `http://localhost:5173` and search for a user.

## API

All routes are under `/api`. Every response is JSON.

| Method | Route | Returns |
| --- | --- | --- |
| `GET` | `/api/health` | Server status. This route isn't rate-limited. |
| `GET` | `/api/users/:input` | A user's profile |
| `GET` | `/api/users/:input/games` | A user's game library |

### What `:input` accepts

| Input | Example |
| --- | --- |
| SteamID64 (17 digits) | `76561197960287930` |
| Custom URL name (case-insensitive) | `gabelogannewell` |
| Profile URL | `https://steamcommunity.com/id/gabelogannewell` |

Profile URLs contain slashes, so they must be URL-encoded (the client uses `encodeURIComponent`). Display names can't be looked up, because Steam has no search for them and they aren't unique.

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/users/gabelogannewell
curl http://localhost:5000/api/users/https%3A%2F%2Fsteamcommunity.com%2Fid%2Fgabelogannewell/games
```

### `GET /api/users/:input`

```json
{
  "steamId": "76561198000000000",
  "displayName": "ExamplePlayer",
  "avatar": "https://avatars.steamstatic.com/<hash>_full.jpg",
  "profileUrl": "https://steamcommunity.com/id/example/",
  "status": "online",
  "isPublic": true,
  "createdAt": "2016-03-14T09:26:53.000Z"
}
```

- `status` is one of `offline`, `online`, `busy`, `away`, `snooze`, `looking to trade`, `looking to play`, or `unknown`.
- `createdAt` is `null` when Steam doesn't share it (for example, on a private profile).

### `GET /api/users/:input/games`

```json
{
  "steamId": "76561198000000000",
  "gameCount": 202,
  "totalPlaytimeHours": 6149,
  "games": [
    {
      "appId": 440,
      "name": "Team Fortress 2",
      "playtimeHours": 812.4,
      "recentHours": 3.5,
      "iconUrl": "https://media.steampowered.com/steamcommunity/public/images/apps/440/<hash>.jpg",
      "lastPlayed": "2026-10-01T18:42:10.000Z"
    }
  ]
}
```

- `games` is sorted by `playtimeHours`, most played first.
- Hours are rounded to one decimal place. `totalPlaytimeHours` is rounded to a whole number.
- `recentHours` covers the last two weeks.
- `iconUrl` and `lastPlayed` can be `null`.

### Errors

Errors are returned as `{ "message": "..." }`.

| Status | When |
| --- | --- |
| `400` | `:input` is empty or longer than 200 characters |
| `403` | The user's game details are private (games route only) |
| `404` | No Steam user matches the input, or the route doesn't exist |
| `429` | The API's rate limit was reached, or Steam's was |
| `502` | Steam's API failed or couldn't be reached |
| `500` | An unexpected server error. The message is hidden. |

### Rate limits

| Scope | Limit |
| --- | --- |
| Everything under `/api` except `/api/health` | 300 requests per 15 minutes |
| `/api/users/*` | 20 requests per minute |

The limits are reported in standard `RateLimit` response headers. The counters are kept in memory, so they reset when the server restarts.

## Caching

Steam allows about 100,000 API calls per day per key, so the server caches Steam's responses in MongoDB. Controllers only talk to the cache layer (`userService`), which calls Steam on a miss.

| Data | Collection | Kept fresh for |
| --- | --- | --- |
| Custom URL name → SteamID | `vanitynames` | 7 days (deleted by a TTL index) |
| Profile | `users` | 10 minutes |
| Game library | `users` | 1 hour |

- Profile and games are stored on the same `users` document but refresh independently.
- A private library is cached too (as `games: null`), so repeated lookups don't call Steam again.
- Errors such as `404` and `502` are never cached.
- To change the TTL on `vanitynames`, drop the existing index (in Atlas or `mongosh`) and restart the server. MongoDB won't update an existing TTL index.

## Scripts

### Server (run from `server/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API in watch mode. Watch mode doesn't reload `.env`, so restart after changing it. |
| `npm start` | Start the API without watch mode |
| `npm run typecheck` | Type-check with `tsc --noEmit`. Node doesn't check types when it runs the server, so run this. |

### Client (run from `client/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 5173 |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |

## Notes

- **Steam errors are never logged in full.** Axios errors include the request URL, and that URL contains the API key.
- **SteamIDs are always strings.** They have 17 digits, which is more than a JavaScript number can hold exactly.
- **Steam's units are converted.** Playtime arrives in minutes and is converted to hours. Timestamps arrive in Unix seconds and are converted to ISO strings.
- **With Atlas, large libraries can be slow to load from a distant cluster.** A library of about 200 games is roughly 50 KB and can take several seconds to transfer. This is network latency, not query time, and it should go away when the server is deployed in the same region as the database.
- **The client always uses dark mode.**
