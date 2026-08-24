import { expect, test, type Locator, type Page } from "@playwright/test";

const RECORDS_STORAGE_KEY = "daymark:records:v1";
const SOLUTION_SHARE_PATH =
  "?date=2026-08-08&difficulty=hard&board=31-6#solution=eyJ2IjoyLCJwIjpbWyJwMSIsNiwwLDBdLFsicDQiLDAsNCwwXSxbImwiLDAsMSwxXSxbIm4iLDAsMywyXSxbInkiLDEsMiw0XSxbInUiLDQsMSwzXSxbInYiLDQsMiwzXV19";
const SOLUTION_PLACEMENTS = [
  { pieceId: "p1", origin: { x: 6, y: 0 }, orientationIndex: 0 },
  { pieceId: "p4", origin: { x: 0, y: 4 }, orientationIndex: 0 },
  { pieceId: "l", origin: { x: 0, y: 1 }, orientationIndex: 1 },
  { pieceId: "n", origin: { x: 0, y: 3 }, orientationIndex: 2 },
  { pieceId: "y", origin: { x: 1, y: 2 }, orientationIndex: 4 },
  { pieceId: "u", origin: { x: 4, y: 1 }, orientationIndex: 3 },
  { pieceId: "v", origin: { x: 4, y: 2 }, orientationIndex: 3 },
] as const;

test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function selectFirstPiece(page: Page): Promise<Locator> {
  const pieces = page.locator("button.piece-tile:not(:disabled)");
  const piece = pieces.first();
  await piece.click();
  await expect(piece).toHaveAttribute("aria-pressed", "true");
  return piece;
}

async function placeSelectedPiece(page: Page): Promise<void> {
  const cells = page.getByRole("button", {
    name: /^Place selected piece on /,
  });
  const cellCount = await cells.count();

  for (let index = 0; index < cellCount; index += 1) {
    await cells.nth(index).click();
    if ((await page.locator(".placed-piece").count()) > 0) return;
  }

  throw new Error("No legal board cell was found for the selected piece");
}

async function getPieceCells(piece: Locator) {
  return piece.locator("rect").evaluateAll((rects) =>
    rects.map((rect) => ({
      x: rect.getAttribute("x"),
      y: rect.getAttribute("y"),
    })),
  );
}

test("places a piece and restores it from local storage", async ({ page }) => {
  const piece = await selectFirstPiece(page);
  await placeSelectedPiece(page);

  await expect(page.locator(".placed-piece")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Reset pieces" }),
  ).toBeEnabled();
  await expect(page.getByText(/1 of \d+ selected/)).toBeVisible();

  const savedRecords = await page.evaluate(
    (storageKey) => localStorage.getItem(storageKey),
    RECORDS_STORAGE_KEY,
  );
  expect(savedRecords).toContain('"placements"');

  await page.reload();
  await expect(page.locator(".placed-piece")).toHaveCount(1);
  await expect(piece).toHaveAttribute("aria-pressed", "false");
});

test("supports orientation shortcuts and keyboard movement", async ({
  page,
}) => {
  const pieces = page.locator("button.piece-tile:not(:disabled)");
  let rotatablePiece: Locator | undefined;

  for (let index = 0; index < (await pieces.count()); index += 1) {
    const candidate = pieces.nth(index);
    await candidate.click();
    if (
      await page
        .getByRole("button", { name: "Rotate selected piece right" })
        .isEnabled()
    ) {
      rotatablePiece = candidate;
      break;
    }
    await candidate.click();
  }

  expect(rotatablePiece).toBeDefined();
  const beforeOrientation = await getPieceCells(rotatablePiece!);
  await page.keyboard.press("r");
  const afterOrientation = await getPieceCells(rotatablePiece!);
  expect(afterOrientation).not.toEqual(beforeOrientation);

  await placeSelectedPiece(page);
  const placedPiece = page.locator(".placed-piece").first();
  await placedPiece.focus();
  const beforeMovement = await getPieceCells(placedPiece);
  let moved = false;

  for (const key of ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]) {
    await page.keyboard.press(key);
    const afterMovement = await getPieceCells(placedPiece);
    if (
      afterMovement.some(
        (cell, index) =>
          cell.x !== beforeMovement[index]?.x ||
          cell.y !== beforeMovement[index]?.y,
      )
    ) {
      moved = true;
      break;
    }
  }

  expect(moved).toBe(true);
});

test("traps settings focus and restores focus on close", async ({ page }) => {
  const settingsButton = page.getByRole("button", { name: "Open settings" });
  await settingsButton.click();

  const dialog = page.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toBeVisible();
  await dialog.focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close settings" }),
  ).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(dialog.locator('[role="tabpanel"]')).toBeFocused();

  await page.getByRole("button", { name: "Close settings" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(settingsButton).toBeFocused();
});

test("opens and closes a pentomino exploration modal", async ({ page }) => {
  await page.getByRole("button", { name: "Explore pentominoes" }).click();
  const factsDialog = page.getByRole("dialog", { name: "Pentominoes" });
  await expect(factsDialog).toBeVisible();

  await page.getByRole("button", { name: "Four rectangles" }).click();
  const tilingsDialog = page.getByRole("dialog", {
    name: "Four rectangles",
  });
  await expect(tilingsDialog).toBeVisible();

  await page.getByRole("button", { name: "Close rectangle tilings" }).click();
  await expect(tilingsDialog).not.toBeVisible();
  await expect(factsDialog).toBeVisible();
});

test("reveals a solution from a share link", async ({ page }) => {
  await page.goto(SOLUTION_SHARE_PATH);
  await expect(
    page.getByRole("button", { name: "Reveal solution" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Reveal solution" }).click();
  await expect(page.getByLabel("Puzzle complete")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Share solution" }),
  ).toHaveCount(0);
});

test("can reveal a shared solution after solving the puzzle", async ({
  page,
}) => {
  await page.evaluate(
    ({ storageKey, placements }) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          schemaVersion: 1,
          puzzles: {
            "31-6:2026-08-08:hard": {
              placements: [...placements].reverse(),
              moveCount: 14,
              completed: true,
              completedAt: "2026-08-08T12:30:00.000Z",
            },
          },
        }),
      );
    },
    { storageKey: RECORDS_STORAGE_KEY, placements: SOLUTION_PLACEMENTS },
  );
  await page.goto(SOLUTION_SHARE_PATH);

  await expect(page.getByLabel("Puzzle complete")).toBeVisible();
  await expect(page.locator(".placed-piece").first()).toHaveAttribute(
    "aria-label",
    "Placed v piece. Use arrow keys to move.",
  );

  await page.getByRole("button", { name: "Reveal solution" }).click();

  await expect(page.locator(".placed-piece").first()).toHaveAttribute(
    "aria-label",
    "Placed p1 piece. Use arrow keys to move.",
  );
  await expect(
    page.getByRole("button", { name: "Reveal solution" }),
  ).toHaveCount(0);
});

test("registers the scoped service worker and precaches the app shell", async ({
  page,
}) => {
  await page.goto("./");

  const serviceWorker = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const cacheNames = await caches.keys();
    const precache = await caches.open("daymark-v1-precache");

    return {
      scope: registration.scope,
      scriptUrl: registration.active?.scriptURL,
      cacheNames,
      precacheUrls: (await precache.keys()).map((request) => request.url),
    };
  });
  const appBaseUrl = new URL(page.url());

  expect(serviceWorker.scope).toBe(appBaseUrl.toString());
  expect(serviceWorker.scriptUrl).toBe(new URL("sw.js", appBaseUrl).toString());
  expect(serviceWorker.cacheNames).toContain("daymark-v1-precache");
  expect(serviceWorker.precacheUrls).toEqual(
    expect.arrayContaining([
      appBaseUrl.toString(),
      new URL("index.html", appBaseUrl).toString(),
    ]),
  );
});

test("shares a normally loaded completed puzzle", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async () => undefined,
    });
  });
  await page.evaluate(
    ({ storageKey, placements }) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          schemaVersion: 1,
          puzzles: {
            "31-6:2026-08-08:hard": {
              placements,
              moveCount: 14,
              completed: true,
              completedAt: "2026-08-08T12:30:00.000Z",
            },
          },
        }),
      );
    },
    { storageKey: RECORDS_STORAGE_KEY, placements: SOLUTION_PLACEMENTS },
  );
  await page.goto("?date=2026-08-08&difficulty=hard&board=31-6");
  await expect(page.getByLabel("Puzzle complete")).toBeVisible();

  const shareResultButton = page.getByRole("button", { name: "Share result" });
  await shareResultButton.click();
  await expect(
    page.getByRole("button", { name: /Copied!|Shared!/ }),
  ).toBeVisible();

  const shareSolutionButton = page.getByRole("button", {
    name: "Share solution",
  });
  await expect(shareSolutionButton).toBeVisible();
  await shareSolutionButton.click();
  await expect(
    page.getByRole("button", { name: /Copied!|Shared!/ }),
  ).toHaveCount(2);
});
