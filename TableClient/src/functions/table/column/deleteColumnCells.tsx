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
  // to delete
  const headerToBeDeleted = headers.filter((header) => header.columnIndex === currentColumnIndex);
  const cellsToBeDeleted = cells.filter((cell) => cell.columnIndex === currentColumnIndex);
  const toBeDeleted = [...headerToBeDeleted, ...cellsToBeDeleted];
  console.log("********** !!! deleteColumnCell.tsx: cellsToBeDeleted",cellsToBeDeleted)
  // to update
  const headersToBeUpdated = headers
    .filter((column) => column.columnIndex > currentColumnIndex)
    .map((column) => ({ ...column, columnIndex: column.columnIndex - 1 }));
  const cellsToBeUpdated = cells
    .filter((cell) => cell.columnIndex > currentColumnIndex)
    .map((cell) => ({ ...cell, columnIndex: cell.columnIndex - 1 }));
  const toBeUpdated = [...headersToBeUpdated, ...cellsToBeUpdated];

  // unchanged
  const unchangedHeaders = [...headers.filter((column) => column.columnIndex < currentColumnIndex),];
  const unchangedCells = [...cells.filter((cell) => cell.columnIndex < currentColumnIndex),];

  // new local
  const newCells = [...unchangedCells, ...cellsToBeUpdated]; // cells after all changes will be applied
  const newHeaders = [...unchangedHeaders, ...headersToBeUpdated]; // headers after all changes will be applied
  const newColIdx = colArrayIdx.filter(e => e !== currentColumnIndex).map(e => e > currentColumnIndex  ? e - 1 : e); 

  return {
    newColIdx,
    newCells,
    newHeaders,
    toBeDeleted,
    toBeUpdated,
  };
};