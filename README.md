# Steam Tracker

A full-stack Steam tracking application with a React/Vite client and a Node.js/Express API server backed by MongoDB.

## Project Structure

```text
steam_tracker/
├── client/   # React 19 + Vite frontend
└── server/   # TypeScript + Express API
```

## Prerequisites

- Node.js 20.6 or newer
- npm
- A MongoDB deployment, such as MongoDB Atlas
- A Steam Web API key if Steam API features are enabled

## Setup

Install dependencies in both packages:

```bash
cd server
npm install

cd ../client
npm install
```

### Server environment

Create `server/.env` from the example file:

```bash
cd server
cp .env.example .env
```

Set the values in `server/.env`:

```env
STEAM_API_KEY=your_steam_api_key
STEAM_API_URL=https://api.steampowered.com
MONGODB_USERNAME=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
MONGODB_URI=
PORT=
CLIENT_URL=
```

Keep `.env` private and do not commit credentials or API keys. URL-encode special characters in the MongoDB username or password when placing them in `MONGODB_URI`.

## Running Locally

Start the API server:

```bash
cd server
npm run dev
```

The server listens on `http://localhost:3001` by default.

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Vite prints the local frontend URL, usually `http://localhost:5173`.

## API

### Health check

```http
GET /api/health
```

Example response:

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

You can check it with:

```bash
curl http://localhost:3001/api/health
```

## Available Scripts

### Server

Run these from `server/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Node watch mode |
| `npm start` | Start the API using `server/.env` |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |

### Client

Run these from `client/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the production bundle |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Development Notes

- The server enables CORS using the `CLIENT_URL` environment variable.
- The server connects to MongoDB before opening its HTTP listener.
- The API uses Helmet, Morgan, JSON request parsing, a 404 handler, and a central error handler.
- The client is currently the Vite React starter interface and is ready for Steam tracking features to be added.
