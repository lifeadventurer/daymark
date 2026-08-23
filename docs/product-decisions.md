# Daymark product decisions

## Product shape

Daymark should feel like a quiet, premium daily puzzle rather than a long
landing page. The primary desktop experience is a single-screen layout with the
date, board, and piece tray visible without page scrolling.

On smaller screens, the layout should stay compact and prioritize the puzzle. If
every control cannot fit comfortably, use a compact tray or panel treatment
instead of shrinking the board until it becomes difficult to play.

## Persistence and accounts

The first version does not require login or a server. Puzzle progress and
completed records are stored locally in the browser with `localStorage`.

Use one versioned storage key:

```text
daymark:records:v1
```

The value is a JSON object whose `puzzles` entries are keyed by board layout,
puzzle date, and difficulty:

```text
{boardKey}:{dateKey}:{difficulty}
```

For example, `31-1:2026-08-18:hard` identifies the hard puzzle for an August
2026 date on the 31-day, Monday-start board. This prevents progress from
different board variants or difficulty levels from colliding.

A saved puzzle contains the placed pieces, each piece's board origin and
orientation, the move count, and completion information.

```ts
{
  schemaVersion: 1,
  puzzles: {
    "31-1:2026-08-18:hard": {
      placements: [
        {
          pieceId: "p",
          origin: { x: 2, y: 1 },
          orientationIndex: 3
        }
      ],
      moveCount: 14,
      completed: true,
      completedAt: "2026-08-18T12:30:00.000Z"
    }
  }
}
```

New records are always written with the namespaced key. For compatibility with
older releases, the app can still read legacy records for the original
Sunday-start board when they use either `{dateKey}:{difficulty}` or the former
date-only hard-puzzle key.

The saved-data schema version is intentionally separate from the `package.json`
app version. App releases and PWA cache versions may change frequently; the
schema version changes only when the stored data format changes and a migration
is needed.

## Puzzle data validation

Puzzle definitions are validated independently from the runtime UI. The
`pnpm validate:puzzles` command checks every configured board variant,
difficulty, piece pool, and calendar date for valid metadata and solvability.
Continuous integration runs this command after the unit tests and before the
production build.

## PWA deployment

The Vite `BASE_PATH` environment variable controls deployments under a
subdirectory. The GitHub Pages deployment uses `/daymark/`. The service worker
is registered below that base path and derives its precache and navigation
fallback URLs from its registration scope so offline navigation remains valid
for both root and subpath deployments.

## Future account layer

Login should remain optional until cross-device history, streaks, leaderboards,
or profiles are genuinely needed. When that time comes, local records can be
merged into a server account rather than making login a prerequisite for
playing.
