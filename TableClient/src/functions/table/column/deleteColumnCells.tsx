import { CellData } from "../../../types/cellType";

interface DeleteColumnProp {
  colArrayIdx: number[],
  currentColumnIndex: number;
  headers: CellData[];
  cells: CellData[];
}

// Function to delete one column of the table locally and return items to be deleted
export const deleteColumnCells = ({
  colArrayIdx,
  currentColumnIndex,
  headers,
  cells,
}: DeleteColumnProp): {
  newCells: CellData[];
  newHeaders: CellData[];
  newColIdx: number[];
} => {
  // Remove the target column and shift others left
  const newHeaders = headers
    .filter((h) => h.columnIndex !== currentColumnIndex)
    .map((h) =>
      h.columnIndex > currentColumnIndex
        ? { ...h, columnIndex: h.columnIndex - 1 }
        : h
    );

  const newCells = cells
    .filter((cell) => cell.columnIndex !== currentColumnIndex)
    .map((cell) =>
      cell.columnIndex > currentColumnIndex
        ? { ...cell, columnIndex: cell.columnIndex - 1 }
        : cell
    );
  
  const newColIdx = colArrayIdx
    .filter((i) => i !== currentColumnIndex)
    .map((i) => (i > currentColumnIndex ? i - 1 : i));

  return {
    newHeaders,
    newCells,
    newColIdx,
  };
};