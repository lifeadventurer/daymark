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

The value is a JSON object keyed by puzzle date. A saved puzzle contains the
placed pieces, each piece's board origin and orientation, the move count, and
completion information.

```ts
{
  schemaVersion: 1,
  puzzles: {
    "2026-08-18": {
      placements: [
        {
          pieceId: "red",
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

The saved-data schema version is intentionally separate from the `package.json`
app version. App releases and PWA cache versions may change frequently; the
schema version changes only when the stored data format changes and a migration
is needed.

## Future account layer

Login should remain optional until cross-device history, streaks, leaderboards,
or profiles are genuinely needed. When that time comes, local records can be
merged into a server account rather than making login a prerequisite for
playing.
