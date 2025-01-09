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
  console.log("HELLO FROM DELETE ROW")
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
      "At DeleteRowCells the lastColumnIndex and lastRowIndex not defined"
    );

  console.log("At DeleteRowCells the lastCellIndex:", lastCellIndex);
  console.log("At DeleteRowCells the lastColumnIndex:", lastColumnIndex);

  // Case 1: Prevent deleting `rowIndex = 0` if there are other rows
  if (currentRowIndex === 0 && lastCellIndex > 0) {
    throw new Error(
      "Cannot delete rowIndex 0 before all other rows are deleted"
    );
  }

  // Step 1: Identify cells to be deleted
  const toBeDeleted = cells.filter((cell) => cell.rowIndex === currentRowIndex);

  // Step 2: Update the `rowIndex` for cells that come after the deleted row
  const toBeUpdated = cells
    .filter((cell) => cell.rowIndex > currentRowIndex)
    .map((cell) => ({ ...cell, rowIndex: cell.rowIndex - 1 }));

  //Step 3: Create the new array excluding the deleted cells and all row-cells after
  const tempArray = [...cells.filter((cell) => cell.rowIndex < currentRowIndex)]
  console.log("At DeleteRowCells the currentRowIndex:", currentRowIndex);
  console.log("At DeleteRowCells the tempArray:", tempArray);

  // Step 4: Create the new array excluding the deleted cells and including the updated cells
  const newCellsArrayAfterDelete = [...tempArray,...toBeUpdated];

  console.log("At DeleteRowCells the toBeDeleted:", toBeDeleted);
  console.log("At DeleteRowCells the toBeUpdated:", toBeUpdated);
  console.log("At DeleteRowCells the newCellsArrayAfterDelete:", newCellsArrayAfterDelete);

  return {
    newCellsArrayAfterDelete: newCellsArrayAfterDelete,
    toBeDeleted: toBeDeleted,
    toBeUpdated: toBeUpdated,
  };
};
//work ok