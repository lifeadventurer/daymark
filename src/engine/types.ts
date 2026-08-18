export interface GridPoint {
  x: number;
  y: number;
}

export interface PieceDefinition {
  id: string;
  cells: GridPoint[];
  allowRotation: boolean;
  allowReflection: boolean;
}

export interface BoardCell extends GridPoint {
  date?: number;
  playable?: boolean;
}

export interface BoardDefinition {
  id: string;
  cells: BoardCell[];
}

export interface PiecePlacement {
  pieceId: string;
  orientation: number;
  origin: GridPoint;
}

export type Orientation = GridPoint[];
