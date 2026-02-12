# Player Rotation Matrix

Mobile-first, local-first PWA for youth basketball coaches to check attendance and run an 8-period participation matrix.

## Features

- Default landing page is fast attendance check-in with large tap cards
- Roster management with ranking and quick rank arrows
- Matrix selection based on `presentCount v opponentCount`
- Full Grid and Game View modes
- Per-session current period persistence
- CSV export
- Local persistence via IndexedDB with localStorage fallback
- Offline-ready, installable PWA

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Deploy static

Deploy the generated `dist/` directory to any static host (Netlify, Vercel static, GitHub Pages, S3 + CloudFront).

## Edit matrix templates

Templates are in `src/matrices/templates.json`.

Each template requires:

- `key`: format `ourCountvopponentCount` (example `7v6`)
- `periods`: must be `8`
- `rules`: object keyed by rank (`"1".."10"`) with exactly 8 statuses (`PLAY` or `SIT`)

Validation logic lives in `src/matrices/matrixUtils.ts`.
