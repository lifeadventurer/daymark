# Contributing to Daymark

Thanks for your interest in improving Daymark. Bug fixes, puzzle improvements,
accessibility work, visual polish, and thoughtful feature proposals are welcome.

## Development setup

Daymark uses Vue, TypeScript, Vite, and pnpm. Use a current Node.js LTS release
and the pnpm version specified in `package.json`.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite. Browser-only state is stored in
`localStorage`, so no database or account setup is required.

## Useful commands

```bash
pnpm test                 # Run the test suite
pnpm test:watch           # Run tests while developing
pnpm lint                 # Check ESLint rules
pnpm format:check        # Check Prettier formatting
pnpm format              # Format the project
pnpm validate:puzzles    # Validate puzzle data and solvability
pnpm build               # Type-check and create a production build
```

Run the relevant checks before opening a pull request. The CI workflow runs
formatting checks, linting, tests, and a production build.

## Working on puzzles

Puzzle definitions live under `src/data/puzzles/`. Keep board metadata, calendar
dates, piece pools, and replacement rules consistent with the existing data
shape. Run `pnpm validate:puzzles` after changing puzzle data; this checks the
catalog and verifies the configured puzzle combinations remain solvable.

Add or update tests when changing puzzle behavior or the engine. Prefer changes
that preserve deterministic puzzle selection for a given date and difficulty.

## Pull requests

Before submitting a pull request:

1. Keep the change focused and explain the user-visible impact.
2. Add tests for behavior that could regress.
3. Run the relevant checks listed above.
4. Include screenshots or a short recording for visual or interaction changes.
5. Call out any accessibility, mobile-layout, or data-compatibility concerns.

Please do not commit secrets, generated build output, or remove third-party
license notices from bundled assets.

## Code style

Use the existing TypeScript and Vue patterns, keep components focused, and use
clear names over clever abstractions. Formatting is handled by Prettier and
linting by ESLint. Husky may run checks automatically during commits.

## License

Contributions should be your own work or work that you have permission to
submit, and should be compatible with the project's MIT License.
