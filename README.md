# Podium

A static Svelte and TypeScript leaderboard for board game sessions. Results live in a JSON file; the site calculates wins, games played, win rate, average finish, points, per-game standings, and recent history in the browser.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the URL printed by Vite to view the leaderboard.

While running `npm run dev`, use **View sample data** or open `/?sample=1` to try the sessions in [`fixtures/results.sample.json`](fixtures/results.sample.json). The built site always reads `public/results.json` and does not include the sample file or link.

## Add a session

Edit [`public/results.json`](public/results.json) directly. Add each session to the `results` array with players in finishing order, winner first. Names are taken from the sessions, so there is no separate player list to maintain.

```json
{
  "results": [
    {
      "game": "Azul",
      "date": "2026-10-06",
      "results": [
        { "name": "Alex", "points": 72 },
        { "name": "Sam", "points": 65 }
      ]
    }
  ]
}
```

The first player in each session wins. `points` and `date` are optional. Dates use `YYYY-MM-DD`. Player and game names match without regard to case. If the JSON or any session is invalid, the page reports the error and shows no results until it is fixed.

## Build

```sh
npm run build
npm run preview
```

Vite writes a static site to `dist/`. Serve the contents of that folder over HTTP, including at a project path such as GitHub Pages. The preview command serves the build locally. Opening `dist/index.html` with `file://` may also work in some browsers, but local module and JSON access varies by browser and settings.
