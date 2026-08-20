import { createBoardDefinition } from "../src/engine/board";
import { findPuzzleSolution } from "../src/engine/solver";
import { calendarBoardVariants, weekdayNames } from "../src/data/puzzleCatalog";
import { pieceDefinitions } from "../src/data/pieces";

const piecesById = new Map(pieceDefinitions.map((piece) => [piece.id, piece]));
const failures: string[] = [];
let checkedCombinations = 0;

for (const [boardKey, boardConfig] of Object.entries(calendarBoardVariants)) {
  const keyParts = boardKey.split("-");
  const daysInMonth = Number(keyParts[0]);
  const startsOnWeekday = Number(keyParts[1]);
  const board = createBoardDefinition(
    `calendar-${boardKey}`,
    boardConfig.cells,
  );
  const dateCells = boardConfig.cells.filter((cell) => cell.date !== undefined);
  const targetDates = dateCells
    .filter((cell) => cell.date !== undefined)
    .map((cell) => cell.date as number)
    .sort((first, second) => first - second);
  const expectedDates = Array.from(
    { length: boardConfig.daysInMonth },
    (_, index) => index + 1,
  );
  const weekday = weekdayNames[startsOnWeekday] ?? `index ${startsOnWeekday}`;

  if (
    keyParts.length !== 2 ||
    !Number.isInteger(daysInMonth) ||
    daysInMonth < 28 ||
    daysInMonth > 31 ||
    !Number.isInteger(startsOnWeekday) ||
    startsOnWeekday < 0 ||
    startsOnWeekday > 6 ||
    !Number.isInteger(boardConfig.daysInMonth) ||
    boardConfig.daysInMonth !== daysInMonth ||
    !Number.isInteger(boardConfig.startsOnWeekday) ||
    boardConfig.startsOnWeekday !== startsOnWeekday
  ) {
    failures.push(`${boardKey}: board key does not match its metadata`);
    continue;
  }
  const nonPlayableDates = dateCells
    .filter((cell) => cell.playable === false)
    .map((cell) => cell.date as number);
  if (nonPlayableDates.length > 0) {
    failures.push(
      `${boardKey}: date cells cannot be non-playable (${nonPlayableDates.join(", ")})`,
    );
    continue;
  }
  if (
    targetDates.length !== boardConfig.daysInMonth ||
    targetDates.some((date, index) => date !== expectedDates[index])
  ) {
    failures.push(
      `${boardKey}: date cells must contain every number from 1 to ${boardConfig.daysInMonth}`,
    );
    continue;
  }

  console.log(
    `\n${boardKey}: ${boardConfig.daysInMonth} days, starts on ${weekday}`,
  );

  for (const [difficulty, difficultyConfig] of Object.entries(
    boardConfig.difficulties,
  )) {
    const piecePools =
      "piecePools" in difficultyConfig
        ? difficultyConfig.piecePools
        : "pieceIds" in difficultyConfig
          ? [difficultyConfig.pieceIds]
          : [];
    if (piecePools.length === 0) {
      failures.push(`${boardKey}/${difficulty}: no piece pools configured`);
      continue;
    }

    let solvedDates = 0;
    for (const [poolIndex, pieceIds] of piecePools.entries()) {
      const poolLabel = `${boardKey}/${difficulty}/pool-${poolIndex + 1}`;
      const unknownPieceIds = pieceIds.filter(
        (pieceId) => !piecesById.has(pieceId),
      );
      if (unknownPieceIds.length > 0) {
        failures.push(
          `${poolLabel}: unknown pieces ${unknownPieceIds.join(", ")}`,
        );
        continue;
      }
      if (new Set(pieceIds).size !== pieceIds.length) {
        failures.push(`${poolLabel}: duplicate piece IDs`);
        continue;
      }
      if (pieceIds.length < boardConfig.requiredPieceCount) {
        failures.push(
          `${poolLabel}: fewer available pieces than required placements`,
        );
        continue;
      }
      if (difficulty === "hard" && pieceIds.length !== 7) {
        failures.push(`${poolLabel}: Hard pools must contain seven pieces`);
        continue;
      }

      const availablePieces = pieceIds.map((pieceId) =>
        piecesById.get(pieceId)!,
      );
      for (const targetDate of targetDates) {
        checkedCombinations += 1;
        const solution = findPuzzleSolution(
          board,
          availablePieces,
          targetDate,
          boardConfig.requiredPieceCount,
        );
        if (solution) {
          solvedDates += 1;
        } else {
          failures.push(`${poolLabel}/date-${targetDate}`);
        }
      }
    }
    console.log(
      `  ${difficulty}: ${solvedDates}/${piecePools.length * targetDates.length} date/pool combinations solvable across ${piecePools.length} pools`,
    );
  }
}

if (failures.length > 0) {
  console.error("\nPuzzle validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  throw new Error(`${failures.length} puzzle validation failure(s)`);
}

console.log(
  `\nPuzzle validation passed: ${checkedCombinations} combinations checked.`,
);
