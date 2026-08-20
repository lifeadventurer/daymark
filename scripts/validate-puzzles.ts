import { findPuzzleSolution } from "../src/engine/solver";
import {
  calendarBoardVariants,
  getCalendarPuzzleConfiguration,
  getPuzzleSetupForPiecePool,
  weekdayNames,
  type CalendarBoardKey,
} from "../src/data/puzzleCatalog";
import { pieceDefinitions } from "../src/data/pieces";

const piecesById = new Map(pieceDefinitions.map((piece) => [piece.id, piece]));
const failures: string[] = [];
let checkedCombinations = 0;

for (const [boardKey, boardConfig] of Object.entries(calendarBoardVariants)) {
  const keyParts = boardKey.split("-");
  const daysInMonth = Number(keyParts[0]);
  const startsOnWeekday = Number(keyParts[1]);
  const puzzle = getCalendarPuzzleConfiguration(boardKey as CalendarBoardKey);
  const board = puzzle.board;
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

  for (const [ruleDateKey, dateRule] of Object.entries(puzzle.dateRules)) {
    const ruleDate = Number(ruleDateKey);
    const ruleLabel = `${boardKey}/date-rule-${ruleDateKey}`;
    if (!Number.isInteger(ruleDate) || !targetDates.includes(ruleDate)) {
      failures.push(`${ruleLabel}: target date is not on the board`);
    }
    if (
      !Number.isInteger(dateRule.requiredPieceCount) ||
      dateRule.requiredPieceCount < 1
    ) {
      failures.push(`${ruleLabel}: required piece count must be positive`);
    }

    for (const [sourcePieceId, replacementIds] of Object.entries(
      dateRule.pieceReplacements,
    )) {
      const replacementLabel = `${ruleLabel}/replace-${sourcePieceId}`;
      const sourcePiece = piecesById.get(sourcePieceId);
      if (!sourcePiece) {
        failures.push(`${replacementLabel}: source piece does not exist`);
        continue;
      }
      if (replacementIds.length === 0) {
        failures.push(`${replacementLabel}: replacement list is empty`);
        continue;
      }
      if (new Set(replacementIds).size !== replacementIds.length) {
        failures.push(`${replacementLabel}: duplicate replacement piece IDs`);
        continue;
      }
      const unknownReplacementIds = replacementIds.filter(
        (pieceId) => !piecesById.has(pieceId),
      );
      if (unknownReplacementIds.length > 0) {
        failures.push(
          `${replacementLabel}: unknown pieces ${unknownReplacementIds.join(", ")}`,
        );
        continue;
      }

      const replacementCellCount = replacementIds.reduce(
        (cellCount, pieceId) =>
          cellCount + (piecesById.get(pieceId)?.cells.length ?? 0),
        0,
      );
      if (replacementCellCount !== sourcePiece.cells.length) {
        failures.push(
          `${replacementLabel}: replacements must preserve ${sourcePiece.cells.length} cells`,
        );
      }
    }
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

      for (const targetDate of targetDates) {
        checkedCombinations += 1;
        const setup = getPuzzleSetupForPiecePool(puzzle, pieceIds, targetDate);
        const setupLabel = `${poolLabel}/date-${targetDate}`;
        const unknownSetupPieceIds = setup.pieceIds.filter(
          (pieceId) => !piecesById.has(pieceId),
        );
        if (unknownSetupPieceIds.length > 0) {
          failures.push(
            `${setupLabel}: unknown pieces ${unknownSetupPieceIds.join(", ")}`,
          );
          continue;
        }
        if (new Set(setup.pieceIds).size !== setup.pieceIds.length) {
          failures.push(`${setupLabel}: duplicate piece IDs`);
          continue;
        }
        if (setup.pieceIds.length < setup.requiredPieceCount) {
          failures.push(
            `${setupLabel}: fewer available pieces than required placements`,
          );
          continue;
        }

        const availablePieces = setup.pieceIds.map((pieceId) =>
          piecesById.get(pieceId)!,
        );
        const solution = findPuzzleSolution(
          board,
          availablePieces,
          targetDate,
          setup.requiredPieceCount,
        );
        if (solution) {
          solvedDates += 1;
        } else {
          failures.push(setupLabel);
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
