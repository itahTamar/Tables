import { CellData } from "../../../types/cellType";
import { findTheLastIndex } from "./../findTheLastIndex";

interface deleteRowProp {
  currentRowIndex: number;
  columns: CellData[];
  cells: CellData[];
}

// Function to delete one row of the table locally and return items to be deleted
export const DeleteRowCells = ({
  currentRowIndex,
  columns,
  cells,
}: deleteRowProp): {
  toBeDeleted: CellData[];
  toBeUpdated: CellData[];
  newCellsArrayAfterDelete: CellData[];
} => {
  // Find the last (max) column index
  const lastColumnIndex = findTheLastIndex({
    arr: columns,
    indexType: "columnIndex",
  });
  if (lastColumnIndex === undefined)
    throw new Error("At DeleteRowCells the lastColumnIndex not defined");

  // Find the last row index
  const lastCellIndex = findTheLastIndex({
    arr: cells,
    indexType: "rowIndex",
  });
  if (lastColumnIndex === undefined || lastCellIndex === undefined)
    throw new Error(
      "At DeleteRowCells the lastColumnIndex and lastCellIndex not defined"
    );

  console.log("At DeleteRowCells the lastCellIndex:", lastCellIndex);
  console.log("At DeleteRowCells the lastColumnIndex:", lastColumnIndex);

  // Case 1: Prevent deleting `rowIndex = 0` if there are other rows
  if (currentRowIndex === 0 && lastCellIndex > 0) {
    throw new Error(
      "Cannot delete rowIndex 0 before all other rows are deleted"
    );
  }

  // Array to store the cells to be deleted
  const toBeDeleted: CellData[] = [];

  // Array to store the cells whose rowIndex will be updated
  const toBeUpdated: CellData[] = [];

  // Find and store the cells to be deleted from the current row
  for (let i = 1; i <= lastColumnIndex; i++) {
    const cellToDelete = cells.find(
      (cell) => cell.rowIndex === currentRowIndex && cell.columnIndex === i
    );
    if (cellToDelete) {
      toBeDeleted.push(cellToDelete);
    }
  }

  // Remove the cells to be deleted from the `cells` array
  for (const cell of toBeDeleted) {
    const index = cells.indexOf(cell);
    if (index !== -1) {
      cells.splice(index, 1);
    }
  }

  // Update the rowIndexes of the remaining cells and collect the updated cells
  if (currentRowIndex < lastCellIndex) {
    for (const cell of cells) {
      if (cell.rowIndex > currentRowIndex) {
        cell.rowIndex -= 1;
        toBeUpdated.push(cell);
      }
    }
  }

  // Return the arrays of cells to be deleted and updated
  return {
    newCellsArrayAfterDelete: cells,
    toBeDeleted: toBeDeleted,
    toBeUpdated: toBeUpdated,
  };
};
