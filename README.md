# Podium

A static Next.js and TypeScript leaderboard for board game sessions. Results live in a JSON file;
the site calculates wins, games played, win rate, average finish, points, per-game standings, and
recent history in the browser. Install dependencies and start the development server below, then
edit `public/results.json` to publish your sessions.

## Run locally

Requires Node.js 20.19 or newer. Use an active Node.js LTS release.

```sh
npm install
npm run dev
```

Open <http://localhost:3000/podium/> to view the leaderboard. The `/podium/` base path applies in
both development and production.

While running `npm run dev`, use **View sample data** or open
<http://localhost:3000/podium/?sample=1> to try the sessions in
[`fixtures/results.sample.json`](fixtures/results.sample.json). The built site always fetches
`public/results.json` at runtime and does not include the sample file or link.

## Source layout

- `src/app/` contains Next.js routes, the root layout, and global theme variables, resets, and
  typography.
- `src/features/leaderboard/` contains the leaderboard screen and its CSS module. Its `components/`
  render complete UI sections, `hooks/` loads results, and `lib/` holds data validation, statistics,
  and formatting.
- `src/components/theme/` contains the theme switch and its CSS module.

CSS follows the
[browser's color preference](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme),
with dark as the default. The switch overrides it for the current page; reloading uses the browser
preference again. Theme choices are not saved.

## Formatting

[Prettier](https://prettier.io/docs/install) formats source files, styles, JSON, Markdown, and YAML
with two-space indentation, single quotes in JavaScript and TypeScript, and a 100-column line width.

```sh
npm run format
npm run format:check
```

`format` writes changes; `format:check` checks without writing and runs before the deployment build.
Generated output, Next.js declarations, TypeScript build metadata, and the npm lockfile are excluded
in `.prettierignore`.

In VS Code, install the recommended **Prettier - Code formatter** extension. Workspace settings
enable formatting on save using the project's installed Prettier version and configuration.

## Add a session

Edit [`public/results.json`](public/results.json) directly. Add each session to the `results` array.
When points are provided, players can appear in any order; the site ranks them from highest to
lowest score. Names are taken from the sessions, so there is no separate player list to maintain.

```json
{
  "results": [
    {
      "game": "Azul",
      "date": "2026-10-06",
      "results": [
        { "name": "Sam", "points": 65 },
        { "name": "Alex", "points": 72 }
      ]
    }
  ]
}
```

Players with the same score share a place, and all players tied for first get a win. If a session
has no points, list its players in finishing order, winner first. Provide points for every player in
a session or none of them. `date` is optional and uses `YYYY-MM-DD`. Player and game names match
without regard to case. If the JSON or any session is invalid, the page reports the error and shows
no results until it is fixed.

## Build

```sh
npm run build
npm run preview
```

Next.js exports the static site to `dist/`; no application server is needed in production. The
preview command serves it at <http://localhost:4173/podium/> and redirects `/` there. Use
`npm run preview -- --port 4174 --host 0.0.0.0` to change the port or listen on other interfaces.

Deploy the contents of `dist/` under `/podium/` over HTTP. The existing GitHub Pages workflow builds
and deploys that folder without changes. `public/results.json` is copied to `dist/results.json` and
fetched from `/podium/results.json` when the page loads, so replacing that deployed file updates the
results without rebuilding the application.
