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
  toBeDeleted: CellData[];
  toBeUpdated: CellData[];
  newCells: CellData[];
  newHeaders: CellData[];
  newColIdx: number[];
} => {

  const toBeDeleted = [
    ...headers.filter(h => h.columnIndex === currentColumnIndex),
    ...cells.filter(c => c.columnIndex === currentColumnIndex),
  ];

  const shift = (doc: CellData): CellData =>
    doc.columnIndex > currentColumnIndex
      ? { ...doc, columnIndex: doc.columnIndex - 1 }
      : doc;

  const filteredHeaders = headers.filter(
    h => h.columnIndex !== currentColumnIndex
  );
  const filteredCells = cells.filter(
    c => c.columnIndex !== currentColumnIndex
  );

  const toBeUpdated = [...filteredHeaders, ...filteredCells]
    .filter(doc => doc.columnIndex > currentColumnIndex)
    .map(shift);

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
    toBeDeleted,
    toBeUpdated,
    newHeaders,
    newCells,
    newColIdx,
  };
};