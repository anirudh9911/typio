# Typio — Real-Time Multiplayer Typing Race

A multiplayer typing race platform where players compete in real-time, track live progress, and climb a global leaderboard.

## Demo

> 📹 Add a demo video link here (e.g. Loom, YouTube)

<!-- Add screenshots below -->
<!--
![Setup Screen](screenshots/setup.png)
![Lobby](screenshots/lobby.png)
![Race](screenshots/race.png)
![Results](screenshots/results.png)
-->

---

## Features

- **Real-time multiplayer** — Race against multiple players simultaneously in private rooms
- **Live progress bars** — See all players' positions update in real-time, sorted by who's ahead
- **Per-character feedback** — Instant correct/incorrect highlighting as you type
- **WPM & accuracy tracking** — Live stats during the race
- **Countdown + synchronized start** — 3-second countdown ensures everyone starts at the same time
- **Configurable duration** — Host chooses 30s or 60s race duration
- **Race results** — Ranked podium sorted by WPM when all players finish
- **Global leaderboard** — Top 10 all-time best WPM scores, updated live after each race
- **Room persistence** — Room state survives server restarts via Redis
- **Unique player names** — Duplicate names are rejected per room with an error message
- **Late joiner support** — Joining a room mid-race gives you the correct remaining time

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, Tailwind CSS |
| Backend | Node.js, Express, Socket.IO |
| Real-time | WebSockets via Socket.IO |
| Cache / Leaderboard | Redis (sorted sets + hashes) |
| Database | PostgreSQL |
| Infrastructure | Docker, Docker Compose |

---

## Architecture

```
┌─────────────────┐        WebSocket        ┌──────────────────┐
│   Next.js App   │ ◄────────────────────► │  Node.js Server  │
│   (Frontend)    │        HTTP REST         │  (Express +      │
└─────────────────┘                         │   Socket.IO)     │
                                            └────────┬─────────┘
                                                     │
                                      ┌──────────────┼──────────────┐
                                      │              │              │
                                 ┌────▼────┐   ┌────▼────┐         │
                                 │  Redis  │   │Postgres │         │
                                 │Leaderbd │   │  Audit  │         │
                                 │+ Rooms  │   │   Log   │         │
                                 └─────────┘   └─────────┘         │
```

**Redis** stores:
- Room state (`room:{roomId}` hash) — persists across restarts
- Global leaderboard (`leaderboard:best` sorted set) — O(log N) updates

**PostgreSQL** stores:
- Historical race results — every race finish is logged with player, WPM, accuracy, placement, and timestamp

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker + Docker Compose

### 1. Clone the repo

```bash
git clone https://github.com/anirudh9911/typio.git
cd typio
```

### 2. Start infrastructure

```bash
docker compose -f infra/docker-compose.yml up -d
```

This starts PostgreSQL on port `5432` and Redis on port `6379`.

### 3. Set up environment variables

**Frontend** — create `apps/web/.env.local`:
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

**Server** — create `apps/server/.env`:
```env
DATABASE_URL=postgresql://typerace:typerace@localhost:5432/typio
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:3000
PORT=3001
```

### 4. Install dependencies

```bash
npm install
```

### 5. Run the apps

In two separate terminals:

```bash
# Terminal 1 — frontend
npm run dev:web

# Terminal 2 — server
npm run dev:server
```

Open [http://localhost:3000](http://localhost:3000)

---

## How to Play

1. Enter your name and create a room (or join with a room code)
2. Share the room code with friends
3. Host selects race duration (30s or 60s) and clicks **Start Race**
4. Type the passage as fast and accurately as possible
5. Results appear when all players finish — leaderboard updates live

---

## Project Structure

```
typio/
├── apps/
│   ├── web/          # Next.js frontend
│   └── server/       # Node.js + Socket.IO backend
├── infra/
│   └── docker-compose.yml
└── package.json      # Workspace root
```

---

## Deployment

The app is designed to deploy on **Vercel** (frontend) + **Railway** (server, Postgres, Redis).

See environment variables above — swap `localhost` URLs for your production URLs in your hosting dashboard. No code changes needed.

---

## License

MIT
