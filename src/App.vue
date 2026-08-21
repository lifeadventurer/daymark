<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";
import DaymarkMark from "./components/DaymarkMark.vue";
import PentominoFactsModal from "./components/PentominoFactsModal.vue";
import SettingsModal from "./components/SettingsModal.vue";
import PieceControls from "./components/PieceControls.vue";
import PuzzleBoard from "./components/PuzzleBoard.vue";
import PieceTray from "./components/PieceTray.vue";
import {
  activeCalendarBoardKey,
  calendarBoardOptions,
  getCalendarBoardKeyForDate,
  getCalendarPuzzleConfiguration,
  getPuzzleSetupForDate,
  type CalendarBoardKey,
  type PuzzleDifficulty,
} from "./data/puzzleCatalog";
import {
  legacyPieceIdAliases,
  pieceColors,
  pieceDefinitions,
  pieceLabels,
} from "./data/pieces";
import { generateOrientations } from "./engine/geometry";
import {
  getTransformedOrientationIndex,
  type OrientationAction,
} from "./engine/orientation";
import {
  getCenteredPlacement,
  isBoardStateLegal,
  isPlacementLegal,
} from "./engine/placement";
import type { GridPoint, PiecePlacement } from "./engine/types";
import { dateFromInputValue, getDateContext } from "./utils/date";
import {
  loadRecordStore,
  saveRecordStore,
  type SavedPuzzleRecord,
} from "./utils/storage";
import {
  createPuzzleShareSummary,
  createPuzzleSolutionShareSummary,
  createPuzzleSolutionShareUrl,
  createPuzzleShareUrl,
  parsePuzzleShareParameters,
  parsePuzzleSolutionShareParameters,
  type SharedSolutionPlacement,
} from "./utils/share";

const initialSharedSolution =
  typeof window === "undefined"
    ? undefined
    : parsePuzzleSolutionShareParameters(
        window.location.search,
        window.location.hash,
      );
const initialSharedPuzzle =
  initialSharedSolution ??
  (typeof window === "undefined"
    ? undefined
    : parsePuzzleShareParameters(window.location.search));
const initialSharedDate = initialSharedPuzzle
  ? dateFromInputValue(initialSharedPuzzle.dateKey)
  : undefined;
const initialSharedBoardKey = initialSharedPuzzle?.boardKey;
const initialBoardKey = calendarBoardOptions.some(
  (option) => option.key === initialSharedBoardKey,
)
  ? (initialSharedBoardKey as CalendarBoardKey)
  : undefined;
const selectedDate = ref(initialSharedDate ?? new Date());
const selectedBoardKey = ref<CalendarBoardKey>(
  initialBoardKey ??
    getCalendarBoardKeyForDate(selectedDate.value) ??
    activeCalendarBoardKey,
);
const selectedDifficulty = ref<PuzzleDifficulty>(
  initialSharedPuzzle?.difficulty ?? "hard",
);
const selectedPieceId = ref<string | null>(null);
const placedPieces = ref<RenderedPiece[]>([]);
const draggingPieceId = ref<string | null>(null);
const previewPlacement = ref<PiecePlacement | null>(null);
const previewValid = ref(false);
const dragMoved = ref(false);
const dragOutsideBoard = ref(false);
const dragPointer = ref<{ x: number; y: number } | null>(null);
const dragReturn = ref<{ piece: RenderedPiece; index: number } | null>(null);
const moveCount = ref(0);
const completed = ref(false);
const completionCelebration = ref(false);
const completedAt = ref<string | null>(null);
const shareStatus = ref<"idle" | "shared" | "copied" | "error">("idle");
const solutionShareStatus = ref<"idle" | "shared" | "copied" | "error">("idle");
const sharedSolution = ref<SharedSolutionPlacement[] | null>(
  initialSharedSolution?.placements ?? null,
);
const solutionRevealed = ref(false);
const solutionRevealError = ref(false);
const records = ref(loadRecordStore());
const pieceOrientations = ref<Record<string, number>>({});
const handledOrientationShortcuts = new Set<string>();
type SettingsTab = "general" | "shortcuts";
const pentominoIds = [
  "f",
  "l",
  "i",
  "p",
  "n",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
] as const;
const settingsOpen = ref(false);
const settingsTab = ref<SettingsTab>("general");
const settingsReturnFocus = ref<HTMLElement | null>(null);
const factsOpen = ref(false);
const factsReturnFocus = ref<HTMLElement | null>(null);
const DevelopmentScenarioPicker = import.meta.env.DEV
  ? defineAsyncComponent(() => import("./dev/DevelopmentScenarioPicker.vue"))
  : null;
const currentPuzzle = computed(() =>
  getCalendarPuzzleConfiguration(selectedBoardKey.value),
);
const calendarBoard = computed(() => currentPuzzle.value.board);
const difficultyDefinitions = computed(
  () => currentPuzzle.value.difficultyDefinitions,
);
const difficultyOptions = computed(() =>
  Object.values(difficultyDefinitions.value),
);
const dateContext = computed(() => getDateContext(selectedDate.value));
const dateBoardKey = computed(() =>
  getCalendarBoardKeyForDate(selectedDate.value),
);
const dateBoardAvailable = computed(() => dateBoardKey.value !== undefined);
const currentPuzzleSetup = computed(() =>
  getPuzzleSetupForDate(
    currentPuzzle.value,
    selectedDifficulty.value,
    dateContext.value.isoDate,
    dateContext.value.dateNumber,
  ),
);
const pieceLimit = computed(() => currentPuzzleSetup.value.requiredPieceCount);
let completionCelebrationTimer: ReturnType<typeof setTimeout> | undefined;
const boardRef = ref<{
  getGridPointFromClient: (
    clientX: number,
    clientY: number,
  ) => { x: number; y: number } | undefined;
  focusPlacedPiece: (pieceId: string) => void;
} | null>(null);
const currentDifficulty = computed(() => {
  const definition = difficultyDefinitions.value[selectedDifficulty.value];
  return {
    ...definition,
    pieceIds: currentPuzzleSetup.value.pieceIds,
  };
});
const shareResultUrl = computed(() => {
  if (typeof window === "undefined") return "";
  return createPuzzleShareUrl(
    dateContext.value.isoDate,
    selectedDifficulty.value,
    window.location.href,
    selectedBoardKey.value,
  );
});
const shareResultSummary = computed(() =>
  createPuzzleShareSummary(
    `${dateContext.value.monthName} ${dateContext.value.dateNumber}, ${dateContext.value.year}`,
    currentDifficulty.value.label,
    moveCount.value,
  ),
);
const shareResultText = computed(() =>
  [shareResultSummary.value, shareResultUrl.value].filter(Boolean).join("\n"),
);
const solutionSharePlacements = computed<SharedSolutionPlacement[]>(() =>
  placedPieces.value.map(({ placement }) => ({
    pieceId: placement.pieceId,
    origin: { ...placement.origin },
    orientationIndex: placement.orientation,
  })),
);
const solutionShareUrl = computed(() => {
  if (typeof window === "undefined") return "";
  return createPuzzleSolutionShareUrl(
    dateContext.value.isoDate,
    selectedDifficulty.value,
    selectedBoardKey.value,
    solutionSharePlacements.value,
    window.location.href,
  );
});
const solutionShareSummary = computed(() =>
  createPuzzleSolutionShareSummary(
    `${dateContext.value.monthName} ${dateContext.value.dateNumber}, ${dateContext.value.year}`,
    currentDifficulty.value.label,
  ),
);
const solutionShareText = computed(() =>
  [solutionShareSummary.value, solutionShareUrl.value]
    .filter(Boolean)
    .join("\n"),
);
const solutionButtonLabel = computed(() => {
  if (solutionShareStatus.value === "shared") return "Shared!";
  if (solutionShareStatus.value === "copied") return "Copied!";
  if (solutionShareStatus.value === "error") return "Try sharing again";
  return "Share solution";
});
const solutionStatusMessage = computed(() => {
  if (solutionShareStatus.value === "shared") {
    return "Solution share sheet opened.";
  }
  if (solutionShareStatus.value === "copied") {
    return "Solution link copied to your clipboard.";
  }
  if (solutionShareStatus.value === "error") {
    return "The solution could not be shared. Try again.";
  }
  return "";
});
const solutionPromptVisible = computed(
  () =>
    Boolean(sharedSolution.value) &&
    !solutionRevealed.value &&
    !completed.value,
);
const shareButtonLabel = computed(() => {
  if (shareStatus.value === "shared") return "Shared!";
  if (shareStatus.value === "copied") return "Copied!";
  if (shareStatus.value === "error") return "Try sharing again";
  return "Share result";
});
const shareStatusMessage = computed(() => {
  if (shareStatus.value === "shared") return "Share sheet opened.";
  if (shareStatus.value === "copied") {
    return "Result copied to your clipboard.";
  }
  if (shareStatus.value === "error") {
    return "The result could not be shared. Try again.";
  }
  return "";
});
const availablePieces = computed(() => {
  const availableIds = new Set(currentDifficulty.value.pieceIds);
  return pieceDefinitions.filter((piece) => availableIds.has(piece.id));
});
const availablePiecesById = computed(
  () => new Map(availablePieces.value.map((piece) => [piece.id, piece])),
);
const placedPieceIds = computed(() =>
  placedPieces.value.map(({ piece }) => piece.id),
);
const canReset = computed(
  () => placedPieces.value.length > 0 || Boolean(dragReturn.value),
);
const draggedPiece = computed(() =>
  availablePieces.value.find((piece) => piece.id === draggingPieceId.value),
);
const selectedPiece = computed(() =>
  availablePieces.value.find((piece) => piece.id === selectedPieceId.value),
);
const dragGhostOrientation = computed(() => {
  if (!draggedPiece.value) return [];
  return (
    generateOrientations(draggedPiece.value)[
      getOrientationIndex(draggedPiece.value)
    ] ?? []
  );
});
const dragGhostSize = computed(() => ({
  width: Math.max(...dragGhostOrientation.value.map((cell) => cell.x), 0) + 1,
  height: Math.max(...dragGhostOrientation.value.map((cell) => cell.y), 0) + 1,
}));
const dragGhostViewBox = computed(
  () =>
    `-0.08 -0.08 ${dragGhostSize.value.width + 0.16} ${dragGhostSize.value.height + 0.16}`,
);
const dragGhostStyle = computed(() => {
  if (!dragPointer.value) return {};

  const cellSize = 34;
  return {
    left: `${dragPointer.value.x + 14}px`,
    top: `${dragPointer.value.y + 14}px`,
    width: `${dragGhostSize.value.width * cellSize}px`,
    height: `${dragGhostSize.value.height * cellSize}px`,
  };
});
const boardStatus = computed(() => {
  if (completed.value) return "Complete";
  if (draggingPieceId.value && dragReturn.value && !dragMoved.value)
    return "Selected piece — drag to move or release to keep";
  if (draggingPieceId.value && previewPlacement.value)
    return previewValid.value
      ? "Good fit — release to place"
      : "That spot is blocked";
  if (draggingPieceId.value) return "Drag onto the canvas";
  if (selectedPiece.value) {
    const action = placedPieceIds.value.includes(selectedPiece.value.id)
      ? "move"
      : "place";
    return `${pieceLabels[selectedPiece.value.id] ?? selectedPiece.value.id} selected — tap a board cell to ${action}`;
  }
  return placedPieces.value.length
    ? `${placedPieces.value.length} of ${pieceLimit.value} selected`
    : "Ready to arrange";
});

interface RenderedPiece {
  piece: (typeof pieceDefinitions)[number];
  placement: PiecePlacement;
  color: string;
}

function clearPuzzleState() {
  selectedPieceId.value = null;
  placedPieces.value = [];
  moveCount.value = 0;
  completed.value = false;
  stopCompletionCelebration();
  completedAt.value = null;
  shareStatus.value = "idle";
  clearSharedSolution();
  pieceOrientations.value = {};
}

function clearSharedSolution() {
  sharedSolution.value = null;
  solutionRevealed.value = false;
  solutionRevealError.value = false;
  solutionShareStatus.value = "idle";
}

function updateDate(event: Event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const nextDate = dateFromInputValue(input.value);
  if (!nextDate || dateContext.value.isoDate === input.value) return;

  endDrag();
  saveCurrentPuzzle();
  clearSharedSolution();
  selectedDate.value = nextDate;
  selectedPieceId.value = null;
  const nextBoardKey = getCalendarBoardKeyForDate(nextDate);
  if (nextBoardKey) {
    selectedBoardKey.value = nextBoardKey;
    loadPuzzleForDate(input.value);
  } else {
    clearPuzzleState();
  }
}

function changeDifficulty(nextDifficulty: PuzzleDifficulty) {
  if (selectedDifficulty.value === nextDifficulty) return;

  endDrag();
  saveCurrentPuzzle();
  clearSharedSolution();
  selectedDifficulty.value = nextDifficulty;
  selectedPieceId.value = null;
  loadPuzzleForDate(dateContext.value.isoDate, nextDifficulty);
}

function changeBoard(nextBoardKey: CalendarBoardKey) {
  if (selectedBoardKey.value === nextBoardKey) return;

  endDrag();
  saveCurrentPuzzle();
  clearSharedSolution();
  const nextPuzzle = getCalendarPuzzleConfiguration(nextBoardKey);
  selectedBoardKey.value = nextBoardKey;
  selectedPieceId.value = null;
  if (dateContext.value.dateNumber > nextPuzzle.daysInMonth) {
    selectedDate.value = new Date(
      selectedDate.value.getFullYear(),
      selectedDate.value.getMonth(),
      nextPuzzle.daysInMonth,
    );
  }
  loadPuzzleForDate(dateContext.value.isoDate);
}

function updateBoard(event: Event) {
  const input = event.target;
  if (!(input instanceof HTMLSelectElement)) return;

  const nextBoardKey = input.value as CalendarBoardKey;
  if (!calendarBoardOptions.some((option) => option.key === nextBoardKey)) {
    return;
  }
  changeBoard(nextBoardKey);
}

const applyDevelopmentScenario = import.meta.env.DEV
  ? (nextBoardKey: CalendarBoardKey, dateKey: string) => {
      const nextDate = dateFromInputValue(dateKey);
      if (!nextDate) return;

      endDrag();
      saveCurrentPuzzle();
      clearSharedSolution();
      selectedBoardKey.value = nextBoardKey;
      selectedDate.value = nextDate;
      selectedPieceId.value = null;
      loadPuzzleForDate(dateKey);
    }
  : null;

function resetPuzzle() {
  endDrag();
  clearPuzzleState();
  saveCurrentPuzzle();
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.append(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  textArea.remove();

  if (!copied) throw new Error("Clipboard copy failed");
}

async function shareResult() {
  if (!completed.value) return;

  try {
    if (typeof navigator.share === "function") {
      await navigator.share({
        title: "Daymark result",
        text: shareResultSummary.value,
        url: shareResultUrl.value,
      });
      shareStatus.value = "shared";
      return;
    }

    await copyTextToClipboard(shareResultText.value);
    shareStatus.value = "copied";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    shareStatus.value = "error";
  }
}

function restoreSolutionPlacements(solution: SharedSolutionPlacement[]) {
  if (solution.length !== pieceLimit.value) return undefined;

  const nextPlacements: RenderedPiece[] = [];
  const nextOrientations: Record<string, number> = {};
  for (const solutionPlacement of solution) {
    const pieceId =
      legacyPieceIdAliases[solutionPlacement.pieceId] ??
      solutionPlacement.pieceId;
    const piece = availablePiecesById.value.get(pieceId);
    if (
      !piece ||
      piece.enabled === false ||
      nextPlacements.some(({ piece: placed }) => placed.id === piece.id)
    ) {
      return undefined;
    }

    const orientationCount = generateOrientations(piece).length;
    const orientation =
      orientationCount > 0
        ? solutionPlacement.orientationIndex % orientationCount
        : 0;
    const placement: PiecePlacement = {
      pieceId: piece.id,
      origin: { ...solutionPlacement.origin },
      orientation,
    };
    if (
      !isPlacementLegal(
        calendarBoard.value,
        piece,
        placement,
        nextPlacements.map(({ placement: existing }) => existing),
        availablePiecesById.value,
        dateContext.value.dateNumber,
      )
    ) {
      return undefined;
    }

    nextPlacements.push({
      piece,
      placement,
      color: pieceColors[piece.id] ?? "#718277",
    });
    nextOrientations[piece.id] = orientation;
  }

  if (
    !isBoardStateLegal(
      calendarBoard.value,
      availablePiecesById.value,
      nextPlacements.map(({ placement }) => placement),
      dateContext.value.dateNumber,
    )
  ) {
    return undefined;
  }

  return { placements: nextPlacements, orientations: nextOrientations };
}

function revealSharedSolution() {
  if (!sharedSolution.value) return;

  const restored = restoreSolutionPlacements(sharedSolution.value);
  if (!restored) {
    solutionRevealError.value = true;
    return;
  }

  endDrag();
  selectedPieceId.value = null;
  placedPieces.value = restored.placements;
  pieceOrientations.value = restored.orientations;
  moveCount.value = 0;
  completed.value = true;
  completedAt.value = null;
  solutionRevealed.value = true;
  solutionRevealError.value = false;
  stopCompletionCelebration();
}

async function shareSolution() {
  if (!completed.value || solutionSharePlacements.value.length === 0) return;

  try {
    if (typeof navigator.share === "function") {
      await navigator.share({
        title: "Daymark solution",
        text: solutionShareSummary.value,
        url: solutionShareUrl.value,
      });
      solutionShareStatus.value = "shared";
      return;
    }

    await copyTextToClipboard(solutionShareText.value);
    solutionShareStatus.value = "copied";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    solutionShareStatus.value = "error";
  }
}

function stopCompletionCelebration() {
  completionCelebration.value = false;
  if (completionCelebrationTimer) {
    clearTimeout(completionCelebrationTimer);
    completionCelebrationTimer = undefined;
  }
}

function celebrateCompletion() {
  stopCompletionCelebration();
  completionCelebration.value = true;
  completionCelebrationTimer = setTimeout(() => {
    completionCelebration.value = false;
    completionCelebrationTimer = undefined;
  }, 1200);
}

function selectPiece(pieceId: string) {
  selectedPieceId.value = selectedPieceId.value === pieceId ? null : pieceId;
}

function startDrag(pieceId: string, event: PointerEvent) {
  const piece = availablePieces.value.find(
    (candidate) => candidate.id === pieceId,
  );
  if (
    !piece ||
    piece.enabled === false ||
    placedPieceIds.value.includes(pieceId) ||
    placedPieces.value.length >= pieceLimit.value
  )
    return;

  beginDrag(pieceId, event, true);
}

function startPlacedDrag(pieceId: string, event: PointerEvent) {
  const index = placedPieces.value.findIndex(
    ({ piece }) => piece.id === pieceId,
  );
  const renderedPiece = placedPieces.value[index];
  if (!renderedPiece || draggingPieceId.value) return;

  placedPieces.value = placedPieces.value.filter(
    ({ piece }) => piece.id !== pieceId,
  );
  dragReturn.value = { piece: renderedPiece, index };
  beginDrag(pieceId, event);
}

function selectPlacedPiece(pieceId: string) {
  if (placedPieceIds.value.includes(pieceId)) selectedPieceId.value = pieceId;
}

function nudgePlacedPiece(pieceId: string, delta: GridPoint) {
  const index = placedPieces.value.findIndex(
    ({ piece }) => piece.id === pieceId,
  );
  const renderedPiece = placedPieces.value[index];
  if (!renderedPiece || draggingPieceId.value) return;

  const candidatePlacement: PiecePlacement = {
    ...renderedPiece.placement,
    origin: {
      x: renderedPiece.placement.origin.x + delta.x,
      y: renderedPiece.placement.origin.y + delta.y,
    },
  };
  const otherPlacements = placedPieces.value
    .filter((_, placementIndex) => placementIndex !== index)
    .map(({ placement }) => placement);
  if (
    !isPlacementLegal(
      calendarBoard.value,
      renderedPiece.piece,
      candidatePlacement,
      otherPlacements,
      availablePiecesById.value,
      dateContext.value.dateNumber,
    )
  ) {
    return;
  }

  const updated = [...placedPieces.value];
  updated[index] = { ...renderedPiece, placement: candidatePlacement };
  placedPieces.value = updated;
  moveCount.value += 1;
  evaluateCompletion();
  saveCurrentPuzzle();
}

function placeSelectedPiece(point: GridPoint) {
  const piece = selectedPiece.value;
  if (!piece || draggingPieceId.value || piece.enabled === false) return;

  const orientationIndex = getOrientationIndex(piece);
  const placement = getCenteredPlacement(piece, orientationIndex, point);
  if (!placement) return;

  const placedIndex = placedPieces.value.findIndex(
    ({ piece: placedPiece }) => placedPiece.id === piece.id,
  );
  if (placedIndex < 0 && placedPieces.value.length >= pieceLimit.value) return;

  const otherPlacements = placedPieces.value
    .filter((_, index) => index !== placedIndex)
    .map(({ placement: existing }) => existing);
  if (
    !isPlacementLegal(
      calendarBoard.value,
      piece,
      placement,
      otherPlacements,
      availablePiecesById.value,
      dateContext.value.dateNumber,
    )
  ) {
    return;
  }

  const renderedPiece = {
    piece,
    placement,
    color: pieceColors[piece.id] ?? "#718277",
  };
  if (placedIndex >= 0) {
    const updated = [...placedPieces.value];
    updated[placedIndex] = renderedPiece;
    placedPieces.value = updated;
  } else {
    placedPieces.value = [...placedPieces.value, renderedPiece];
  }

  moveCount.value += 1;
  selectedPieceId.value = null;
  void nextTick(() => boardRef.value?.focusPlacedPiece(piece.id));
  evaluateCompletion();
  saveCurrentPuzzle();
}

function beginDrag(
  pieceId: string,
  event: PointerEvent,
  startsOutsideBoard = false,
) {
  const initialPlacement = dragReturn.value?.piece.placement;
  event.preventDefault();
  selectedPieceId.value = pieceId;
  draggingPieceId.value = pieceId;
  dragPointer.value = { x: event.clientX, y: event.clientY };
  previewPlacement.value = initialPlacement
    ? {
        ...initialPlacement,
        origin: { ...initialPlacement.origin },
      }
    : null;
  previewValid.value = Boolean(initialPlacement);
  dragMoved.value = false;
  dragOutsideBoard.value = startsOutsideBoard;
  window.addEventListener("pointermove", handlePointerMove, {
    passive: false,
  });
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", cancelDrag);
  window.addEventListener("touchmove", preventTouchMove, { passive: false });
}

function getOrientationIndex(piece: (typeof pieceDefinitions)[number]) {
  const orientations = generateOrientations(piece);
  if (orientations.length === 0) return 0;
  return (
    (((pieceOrientations.value[piece.id] ?? 0) % orientations.length) +
      orientations.length) %
    orientations.length
  );
}

function changeSelectedOrientation(action: OrientationAction) {
  const pieceId = selectedPieceId.value;
  const piece = availablePieces.value.find(
    (candidate) => candidate.id === pieceId,
  );
  if (!piece) return;
  const currentIndex = getOrientationIndex(piece);

  const nextIndex = getTransformedOrientationIndex(piece, currentIndex, action);
  if (nextIndex === undefined || nextIndex === currentIndex) return;

  const placedIndex = placedPieces.value.findIndex(
    ({ piece: placedPiece }) => placedPiece.id === piece.id,
  );
  if (draggingPieceId.value) {
    if (previewPlacement.value) {
      const candidatePlacement = {
        ...previewPlacement.value,
        orientation: nextIndex,
      };
      previewPlacement.value = candidatePlacement;
      previewValid.value = isPlacementLegal(
        calendarBoard.value,
        piece,
        candidatePlacement,
        placedPieces.value.map(({ placement: existing }) => existing),
        availablePiecesById.value,
        dateContext.value.dateNumber,
      );
    }
    pieceOrientations.value = {
      ...pieceOrientations.value,
      [piece.id]: nextIndex,
    };
    dragMoved.value = true;
    return;
  } else if (placedIndex >= 0) {
    const currentPlacement = placedPieces.value[placedIndex].placement;
    const candidatePlacement = { ...currentPlacement, orientation: nextIndex };
    const otherPlacements = placedPieces.value
      .filter((_, index) => index !== placedIndex)
      .map(({ placement }) => placement);
    const isLegal = isPlacementLegal(
      calendarBoard.value,
      piece,
      candidatePlacement,
      otherPlacements,
      availablePiecesById.value,
      dateContext.value.dateNumber,
    );
    if (!isLegal) return;

    const updated = [...placedPieces.value];
    updated[placedIndex] = {
      ...updated[placedIndex],
      placement: candidatePlacement,
    };
    placedPieces.value = updated;
  }

  pieceOrientations.value = {
    ...pieceOrientations.value,
    [piece.id]: nextIndex,
  };
  moveCount.value += 1;
  evaluateCompletion();
  saveCurrentPuzzle();
}

function isTextEntryTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function getOrientationAction(
  event: KeyboardEvent,
): OrientationAction | undefined {
  const key = event.key.toLowerCase();
  return key === "r"
    ? event.shiftKey
      ? "rotate-left"
      : "rotate-right"
    : key === "h"
      ? "flip-horizontal"
      : key === "v"
        ? "flip-vertical"
        : undefined;
}

function getOrientationShortcutKey(event: KeyboardEvent): string {
  return `${event.key.toLowerCase()}:${event.shiftKey ? "shift" : "plain"}`;
}

function shouldIgnoreOrientationShortcut(event: KeyboardEvent): boolean {
  if (
    event.defaultPrevented ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    isTextEntryTarget(event.target)
  ) {
    return true;
  }
  return false;
}

function isShortcutsShortcut(event: KeyboardEvent): boolean {
  return event.code === "Slash" && (event.metaKey || event.ctrlKey);
}

function openSettings(tab: SettingsTab = "general") {
  if (settingsOpen.value) return;
  settingsTab.value = tab;
  settingsReturnFocus.value =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  settingsOpen.value = true;
}

function closeSettings() {
  settingsOpen.value = false;
  const returnFocus = settingsReturnFocus.value;
  settingsReturnFocus.value = null;
  if (returnFocus?.isConnected) returnFocus.focus();
}

function openFacts() {
  if (factsOpen.value) return;
  factsReturnFocus.value =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  factsOpen.value = true;
}

function closeFacts() {
  factsOpen.value = false;
  const returnFocus = factsReturnFocus.value;
  factsReturnFocus.value = null;
  if (returnFocus?.isConnected) returnFocus.focus();
}

function handleGlobalKeydown(event: KeyboardEvent) {
  if (factsOpen.value) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (
        event.target instanceof Element &&
        event.target.closest(".tilings-modal")
      ) {
        return;
      }
      closeFacts();
    }
    return;
  }

  if (isShortcutsShortcut(event)) {
    event.preventDefault();
    if (settingsOpen.value) {
      closeSettings();
    } else {
      openSettings("shortcuts");
    }
    return;
  }

  if (settingsOpen.value) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSettings();
    }
    return;
  }

  if (shouldIgnoreOrientationShortcut(event)) return;

  const action = getOrientationAction(event);
  if (!action || !selectedPieceId.value) return;

  event.preventDefault();
  handledOrientationShortcuts.add(getOrientationShortcutKey(event));
  changeSelectedOrientation(action);
}

function handleGlobalKeyup(event: KeyboardEvent) {
  const shortcutKey = getOrientationShortcutKey(event);
  if (handledOrientationShortcuts.delete(shortcutKey)) return;
  if (settingsOpen.value || factsOpen.value) return;
  if (shouldIgnoreOrientationShortcut(event)) return;

  const action = getOrientationAction(event);
  if (!action || !selectedPieceId.value) return;

  event.preventDefault();
  changeSelectedOrientation(action);
}

function clearHandledOrientationShortcuts() {
  handledOrientationShortcuts.clear();
}

function handlePointerMove(event: PointerEvent) {
  if (!draggedPiece.value || !boardRef.value) return;
  event.preventDefault();

  dragPointer.value = { x: event.clientX, y: event.clientY };
  dragMoved.value = true;
  const point = boardRef.value.getGridPointFromClient(
    event.clientX,
    event.clientY,
  );
  if (!point) {
    dragOutsideBoard.value = true;
    previewPlacement.value = null;
    previewValid.value = false;
    return;
  }

  dragOutsideBoard.value = false;
  const orientationIndex = getOrientationIndex(draggedPiece.value);
  const placement = getCenteredPlacement(
    draggedPiece.value,
    orientationIndex,
    point,
  );
  if (!placement) return;

  previewPlacement.value = placement;
  previewValid.value = isPlacementLegal(
    calendarBoard.value,
    draggedPiece.value,
    placement,
    placedPieces.value.map(({ placement: existing }) => existing),
    availablePiecesById.value,
    dateContext.value.dateNumber,
  );
}

function preventTouchMove(event: TouchEvent) {
  if (draggingPieceId.value) event.preventDefault();
}

function endDrag(_event?: PointerEvent, restorePlacedPiece = false) {
  if (!draggingPieceId.value) return;

  const piece = draggedPiece.value;
  const placedSuccessfully =
    piece && dragMoved.value && previewPlacement.value && previewValid.value;
  if (placedSuccessfully && piece && previewPlacement.value) {
    placedPieces.value = [
      ...placedPieces.value,
      {
        piece,
        placement: previewPlacement.value,
        color: pieceColors[piece.id] ?? "#718277",
      },
    ];
    moveCount.value += 1;
    pieceOrientations.value = {
      ...pieceOrientations.value,
      [piece.id]: previewPlacement.value.orientation,
    };
    selectedPieceId.value = null;
    void nextTick(() => boardRef.value?.focusPlacedPiece(piece.id));
  } else if (
    dragReturn.value &&
    (restorePlacedPiece || !dragOutsideBoard.value)
  ) {
    const restored = [...placedPieces.value];
    restored.splice(dragReturn.value.index, 0, dragReturn.value.piece);
    placedPieces.value = restored;
    pieceOrientations.value = {
      ...pieceOrientations.value,
      [dragReturn.value.piece.piece.id]:
        dragReturn.value.piece.placement.orientation,
    };
  }

  evaluateCompletion();
  saveCurrentPuzzle();

  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerup", endDrag);
  window.removeEventListener("pointercancel", cancelDrag);
  window.removeEventListener("touchmove", preventTouchMove);
  draggingPieceId.value = null;
  previewPlacement.value = null;
  previewValid.value = false;
  dragMoved.value = false;
  dragOutsideBoard.value = false;
  dragPointer.value = null;
  dragReturn.value = null;
}

function cancelDrag() {
  endDrag(undefined, true);
}

function evaluateCompletion(shouldCelebrate = true) {
  const wasComplete = completed.value;
  const isComplete =
    placedPieces.value.length === pieceLimit.value &&
    isBoardStateLegal(
      calendarBoard.value,
      availablePiecesById.value,
      placedPieces.value.map(({ placement }) => placement),
      dateContext.value.dateNumber,
    );

  completed.value = isComplete;
  if (shouldCelebrate && isComplete && !wasComplete) celebrateCompletion();
  completedAt.value = isComplete
    ? (completedAt.value ?? new Date().toISOString())
    : null;
}

function getPuzzleStorageKey(
  boardKey: CalendarBoardKey,
  dateKey: string,
  difficulty: PuzzleDifficulty,
): string {
  return `${boardKey}:${dateKey}:${difficulty}`;
}

function getLegacyPuzzleStorageKey(
  dateKey: string,
  difficulty: PuzzleDifficulty,
): string {
  return `${dateKey}:${difficulty}`;
}

function saveCurrentPuzzle(
  dateKey = dateContext.value.isoDate,
  difficulty = selectedDifficulty.value,
) {
  const puzzle: SavedPuzzleRecord = {
    placements: placedPieces.value.map(({ placement }) => ({
      pieceId: placement.pieceId,
      origin: { ...placement.origin },
      orientationIndex: placement.orientation,
    })),
    moveCount: moveCount.value,
    completed: completed.value,
    completedAt: completedAt.value,
  };
  records.value = {
    ...records.value,
    puzzles: {
      ...records.value.puzzles,
      [getPuzzleStorageKey(selectedBoardKey.value, dateKey, difficulty)]:
        puzzle,
    },
  };
  saveRecordStore(records.value);
}

function loadPuzzleForDate(
  dateKey: string,
  difficulty = selectedDifficulty.value,
) {
  const boardSpecificSaved =
    records.value.puzzles[
      getPuzzleStorageKey(selectedBoardKey.value, dateKey, difficulty)
    ];
  const saved =
    boardSpecificSaved ??
    // Older records were created before board variants were namespaced and
    // belong to the original Sunday-start layout.
    (selectedBoardKey.value === "31-0"
      ? (records.value.puzzles[
          getLegacyPuzzleStorageKey(dateKey, difficulty)
        ] ??
        (difficulty === "hard" ? records.value.puzzles[dateKey] : undefined))
      : undefined);
  const piecesById = availablePiecesById.value;
  const nextPlacements: RenderedPiece[] = [];
  const nextOrientations: Record<string, number> = {};
  let savedStateValid = !saved || saved.placements.length <= pieceLimit.value;

  if (saved && saved.placements.length <= pieceLimit.value) {
    for (const savedPlacement of saved.placements) {
      const pieceId =
        legacyPieceIdAliases[savedPlacement.pieceId] ?? savedPlacement.pieceId;
      const piece = piecesById.get(pieceId);
      if (
        !piece ||
        piece.enabled === false ||
        nextPlacements.some(({ piece: placed }) => placed.id === piece.id)
      ) {
        savedStateValid = false;
        nextPlacements.length = 0;
        break;
      }
      const orientationCount = generateOrientations(piece).length;
      const orientation =
        orientationCount > 0
          ? savedPlacement.orientationIndex % orientationCount
          : 0;
      const placement: PiecePlacement = {
        pieceId: piece.id,
        origin: { ...savedPlacement.origin },
        orientation,
      };
      if (
        !isPlacementLegal(
          calendarBoard.value,
          piece,
          placement,
          nextPlacements.map(({ placement: existing }) => existing),
          piecesById,
          dateContext.value.dateNumber,
        )
      ) {
        savedStateValid = false;
        nextPlacements.length = 0;
        break;
      }
      nextPlacements.push({
        piece,
        placement,
        color: pieceColors[piece.id] ?? "#718277",
      });
      nextOrientations[piece.id] = orientation;
    }
  }

  placedPieces.value = nextPlacements;
  pieceOrientations.value = nextOrientations;
  moveCount.value = savedStateValid ? (saved?.moveCount ?? 0) : 0;
  completed.value = false;
  stopCompletionCelebration();
  completedAt.value = savedStateValid ? (saved?.completedAt ?? null) : null;
  shareStatus.value = "idle";
  solutionShareStatus.value = "idle";
  evaluateCompletion(false);
}

loadPuzzleForDate(dateContext.value.isoDate);

onMounted(() => {
  window.addEventListener("keydown", handleGlobalKeydown, true);
  window.addEventListener("keyup", handleGlobalKeyup, true);
  window.addEventListener("blur", clearHandledOrientationShortcuts);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleGlobalKeydown, true);
  window.removeEventListener("keyup", handleGlobalKeyup, true);
  window.removeEventListener("blur", clearHandledOrientationShortcuts);
  cancelDrag();
  stopCompletionCelebration();
});
</script>

<template>
  <main class="app-shell">
    <div
      v-if="dragOutsideBoard && draggedPiece && dragPointer"
      class="drag-ghost"
      :style="dragGhostStyle"
      aria-hidden="true"
    >
      <svg class="drag-ghost__svg" :viewBox="dragGhostViewBox">
        <rect
          v-for="cell in dragGhostOrientation"
          :key="`drag-ghost-${cell.x}-${cell.y}`"
          :x="cell.x + 0.05"
          :y="cell.y + 0.05"
          width="0.9"
          height="0.9"
          rx="0.15"
          :fill="pieceColors[draggedPiece.id] ?? '#718277'"
          :stroke="pieceColors[draggedPiece.id] ?? '#718277'"
        />
      </svg>
      <span class="drag-ghost__return" aria-hidden="true">↩</span>
    </div>
    <header class="topbar">
      <a class="wordmark" href="/" aria-label="Daymark home">
        <DaymarkMark :size="40" />
        <span>Daymark</span>
      </a>
      <button
        class="settings-button"
        type="button"
        aria-label="Open settings"
        aria-haspopup="dialog"
        @click="openSettings()"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M9.7 3.5h4.6l.6 2.1a7.1 7.1 0 0 1 1.4.8l2.1-.6 2.3 4-1.6 1.5a7.3 7.3 0 0 1 0 1.6l1.6 1.5-2.3 4-2.1-.6a7.1 7.1 0 0 1-1.4.8l-.6 2.1H9.7l-.6-2.1a7.1 7.1 0 0 1-1.4-.8l-2.1.6-2.3-4 1.6-1.5a7.3 7.3 0 0 1 0-1.6L3.3 9.8l2.3-4 2.1.6a7.1 7.1 0 0 1 1.4-.8l.6-2.1Z"
          />
          <circle cx="12" cy="12" r="2.7" />
        </svg>
      </button>
    </header>

    <section class="puzzle-layout" aria-label="Daymark puzzle">
      <div
        class="board-column"
        :class="{
          'board-column--complete': completed && !draggingPieceId,
          'board-column--celebrate': completionCelebration,
        }"
      >
        <span class="sr-only" aria-live="polite">
          {{ boardStatus }}
        </span>
        <PuzzleBoard
          v-if="dateBoardAvailable"
          ref="boardRef"
          :board="calendarBoard"
          :target-date="dateContext.dateNumber"
          :month-name="dateContext.monthName"
          :date-value="dateContext.isoDate"
          :placed-pieces="placedPieces"
          :preview="
            draggedPiece && previewPlacement
              ? {
                  piece: draggedPiece,
                  placement: previewPlacement,
                  color: pieceColors[draggedPiece.id] ?? '#718277',
                }
              : null
          "
          :preview-valid="previewValid"
          :placement-enabled="Boolean(selectedPieceId)"
          @cell-select="placeSelectedPiece"
          @date-change="updateDate"
          @drag-start="startPlacedDrag"
          @select-piece="selectPlacedPiece"
          @nudge="nudgePlacedPiece"
        />
        <div
          v-else
          class="board-shell board-unavailable"
          role="status"
          aria-live="polite"
        >
          <div class="board-heading">
            <span class="board-heading__month">
              {{ dateContext.monthName }}
            </span>
            <input
              :value="dateContext.isoDate"
              type="date"
              aria-label="Choose puzzle date"
              @change="updateDate"
            />
          </div>
          <div class="board-unavailable__content">
            <strong>Board coming soon</strong>
            <p>
              The {{ dateContext.monthName }} {{ dateContext.year }} calendar
              will be available soon.
            </p>
          </div>
        </div>
        <PieceControls
          v-if="dateBoardAvailable"
          class="piece-controls--mobile"
          :selected-piece="selectedPiece"
          :can-reset="canReset"
          :dragging="Boolean(draggingPieceId)"
          @rotate-left="changeSelectedOrientation('rotate-left')"
          @rotate-right="changeSelectedOrientation('rotate-right')"
          @flip-horizontal="changeSelectedOrientation('flip-horizontal')"
          @flip-vertical="changeSelectedOrientation('flip-vertical')"
          @reset="resetPuzzle"
        />
        <div
          v-if="completed && !draggingPieceId"
          class="completion-mark"
          role="status"
          aria-label="Puzzle complete"
        >
          ✓
          <span class="sr-only">Puzzle complete</span>
        </div>
      </div>

      <aside class="side-panel">
        <DevelopmentScenarioPicker
          v-if="DevelopmentScenarioPicker && applyDevelopmentScenario"
          :board-key="selectedBoardKey"
          :date-key="dateContext.isoDate"
          @select="applyDevelopmentScenario"
        />
        <template v-if="dateBoardAvailable">
          <section
            v-if="solutionPromptVisible"
            class="solution-prompt"
            aria-labelledby="solution-prompt-title"
          >
            <strong id="solution-prompt-title">A solution is available</strong>
            <p>Reveal it when you're ready.</p>
            <button type="button" @click="revealSharedSolution">
              Reveal solution
            </button>
            <p
              v-if="solutionRevealError"
              class="solution-prompt__error"
              role="alert"
            >
              This solution link does not match the current puzzle.
            </p>
          </section>
          <label
            v-if="DevelopmentScenarioPicker && applyDevelopmentScenario"
            class="board-picker"
          >
            <span>Board</span>
            <select
              :value="selectedBoardKey"
              aria-label="Choose board layout"
              @change="updateBoard"
            >
              <option
                v-for="boardOption in calendarBoardOptions"
                :key="boardOption.key"
                :value="boardOption.key"
              >
                {{ boardOption.label }}
              </option>
            </select>
          </label>
          <fieldset class="difficulty-picker">
            <legend>Difficulty</legend>
            <div class="difficulty-picker__options">
              <button
                v-for="difficulty in difficultyOptions"
                :key="difficulty.id"
                type="button"
                :class="{
                  'difficulty-picker__option--selected':
                    selectedDifficulty === difficulty.id,
                }"
                :aria-pressed="selectedDifficulty === difficulty.id"
                :title="difficulty.description"
                @click="changeDifficulty(difficulty.id)"
              >
                {{ difficulty.label }}
              </button>
            </div>
          </fieldset>
          <PieceTray
            :pieces="availablePieces"
            :selected-piece-id="selectedPieceId"
            :placed-piece-ids="placedPieceIds"
            :labels="pieceLabels"
            :colors="pieceColors"
            :orientations="pieceOrientations"
            :can-place-more="placedPieces.length < pieceLimit"
            :can-reset="canReset"
            :dragging="Boolean(draggingPieceId)"
            @select="selectPiece"
            @drag-start="startDrag"
            @rotate-left="changeSelectedOrientation('rotate-left')"
            @rotate-right="changeSelectedOrientation('rotate-right')"
            @flip-horizontal="changeSelectedOrientation('flip-horizontal')"
            @flip-vertical="changeSelectedOrientation('flip-vertical')"
            @reset="resetPuzzle"
          />
          <div
            v-if="completed && !draggingPieceId && !solutionRevealed"
            class="share-result"
          >
            <div class="share-result__actions">
              <button
                class="share-result__button"
                type="button"
                :aria-describedby="
                  shareStatusMessage ? 'share-result-status' : undefined
                "
                @click="shareResult"
              >
                {{ shareButtonLabel }}
              </button>
              <button
                class="share-result__button share-result__button--secondary"
                type="button"
                :aria-describedby="
                  solutionStatusMessage ? 'solution-share-status' : undefined
                "
                @click="shareSolution"
              >
                {{ solutionButtonLabel }}
              </button>
            </div>
            <p
              v-if="shareStatusMessage"
              id="share-result-status"
              class="share-result__status"
              role="status"
            >
              {{ shareStatusMessage }}
            </p>
            <p
              v-if="solutionStatusMessage"
              id="solution-share-status"
              class="share-result__status"
              role="status"
            >
              {{ solutionStatusMessage }}
            </p>
          </div>
        </template>
        <div v-else class="board-unavailable__side-message" role="status">
          Puzzle controls will appear when this month’s board is ready.
        </div>
      </aside>
    </section>

    <button
      class="pentomino-facts-trigger"
      type="button"
      aria-label="Explore pentominoes"
      aria-haspopup="dialog"
      title="Pentominoes"
      @click="openFacts"
    >
      <span class="pentomino-facts-trigger__letters" aria-hidden="true">
        <span
          v-for="pieceId in pentominoIds"
          :key="pieceId"
          :style="{ color: pieceColors[pieceId] }"
        >
          {{ pieceId.toUpperCase() }}
        </span>
      </span>
    </button>

    <SettingsModal
      v-if="settingsOpen"
      :initial-tab="settingsTab"
      @close="closeSettings"
    />
    <PentominoFactsModal v-if="factsOpen" @close="closeFacts" />
  </main>
</template>
