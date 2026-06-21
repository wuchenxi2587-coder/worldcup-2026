# 2026 FIFA World Cup — Data Portal & Prediction Platform

A single-page web application for the 2026 FIFA World Cup with two main modules:
1. **Predictions** — guess match results, earn points, climb the leaderboard
2. **Data Analytics** — interactive charts and visualizations for teams, players, and tournament stats

> ⚠ **All data is simulated/placeholder.** This is a demo. No real money or gambling involved.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
worldcup-2026/
├── src/
│   ├── api.ts                  # Data loading adapter (swap to real API here)
│   ├── types.ts                # All TypeScript types
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root layout + routing
│   ├── index.css               # Tailwind + custom theme variables
│   ├── components/
│   │   ├── Common/             # Reusable: TeamBadge, FixtureCard, StatBar, KpiCard
│   │   └── Layout/Navbar.tsx   # Top navigation with theme toggle
│   ├── pages/
│   │   ├── Dashboard.tsx       # Home — countdown, KPIs, featured matchup
│   │   ├── Fixtures.tsx        # Match schedule with filters
│   │   ├── MatchDetail.tsx     # Match info + 3 analysis modules
│   │   ├── Standings.tsx       # Group tables + best 3rd place ranking
│   │   ├── Bracket.tsx         # 32-team knockout tree
│   │   ├── Prediction.tsx      # User profiles, predictions, leaderboard, stats
│   │   ├── Analytics.tsx       # Radar, bar, line, treemap charts
│   │   └── Settings.tsx        # Theme, language, scoring rules
│   ├── store/
│   │   ├── dataStore.ts        # Zustand store for match/team/player data
│   │   ├── predictionStore.ts   # Zustand store for predictions + users (localStorage)
│   │   └── settingsStore.ts    # Zustand store for theme/lang/scoring (localStorage)
│   └── data/
│       ├── teams.json          # 48 teams with FIFA ranks & stats
│       ├── matches.json        # 104 matches (72 group + 32 knockout)
│       ├── cities.json         # 16 host cities
│       ├── players.json        # ~864 players across all teams
│       └── lineups.json        # Sample match lineups
```

## Features

### Dashboard
- Countdown to June 11, 2026
- KPI cards: teams, completed matches, total goals, goals per match
- Featured matchup with radar chart comparison
- Upcoming matches sidebar

### Fixtures
- Filter by stage (group, R32, R16, QF, SF, final)
- Filter by group (A–L)
- Search by team name
- 104 matches total across 39 days

### Match Detail (with 3 Analysis Modules)
1. **Qualification Probability** — what-if simulation: win/draw/loss scenarios and their impact on advancing
2. **Knockout Path Projection** — projected opponents through each round with win probabilities
3. **Head-to-Head** — radar comparison, FIFA rank, and SVG football field with lineup visualization

### Standings
- 12 group tables with standard FIFA tiebreakers
- Best 3rd-place ranking (critical for 48-team format)
- Color-coded qualification status

### Bracket
- Empty 32-team knockout tree (populates as results come in)
- Zoom controls for exploration

### Predictions
- Multi-user support with nickname-based profiles
- Score predictions with editable fields
- Leaderboard with gold/silver/bronze medals
- Personal stats: accuracy, points chart, prediction history
- Configurable scoring rules

### Analytics Center
- **Team Power Radar** — 8 top teams overlaid on 5 dimensions
- **Overall Team Rating** — horizontal bar chart
- **Goals by Group** — bar chart per group
- **Prize Money Evolution** — line chart 1982–2026
- **Tournament Size** — step chart showing 16→24→32→48 teams
- **Confederation Treemap** — distribution of 48 teams
- **Host Cities Grid** — all 16 venues across USA/MEX/CAN

### Settings
- Dark/Light theme toggle
- Language toggle (中文/English)
- Customizable scoring points
- Clear all data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| State | Zustand (persisted to localStorage) |
| Routing | React Router 7 |
| Data | Static JSON (with `api.ts` adapter for future API swap) |

## Switching to Real Data

The `src/api.ts` file has all data fetch functions. To switch to a real API:

1. Replace the `loadFromModule()` calls with `fetch()` calls
2. Point `BASE_URL` to your API endpoint
3. Ensure the API returns data matching the TypeScript types in `src/types.ts`

## 2026 Tournament Format

- **48 teams** · **12 groups (A–L)** · **4 teams per group**
- Top 2 from each group + 8 best 3rd-place teams = **32 teams** advance
- Knockout: R32 → R16 → QF → SF → Final
- **104 matches** total · June 11 – July 19, 2026
- 16 host cities across USA (11), Mexico (3), Canada (2)
- Final: MetLife Stadium, New York/New Jersey

## License

MIT — Data is simulated and not affiliated with FIFA.
