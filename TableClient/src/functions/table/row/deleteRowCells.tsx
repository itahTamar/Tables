import { CellData } from "../../../types/cellType";

interface deleteRowProp {
  currentRowIndex: number;
  cells: CellData[];
  numOfRows: number;
  rowIndexesDisplayArr: number[];
}

// Function to delete one row of the table locally and return items to be deleted
export const DeleteRowCells = ({
  currentRowIndex,
  cells,
  numOfRows,
  rowIndexesDisplayArr,
}: deleteRowProp): {
  toBeDeleted: CellData[];
  toBeUpdated: CellData[];
  newCellsArrayAfterDelete: CellData[];
  updatedRowIndexesArr: number[];
} => {
  console.log("HELLO FROM DELETE ROW");
  // Case 1: Prevent deleting `rowIndex = 0` if there are other rows
  if (currentRowIndex === 0 && numOfRows > 0) {
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
  const tempArray = [
    ...cells.filter((cell) => cell.rowIndex < currentRowIndex),
  ];
  console.log("At DeleteRowCells the currentRowIndex:", currentRowIndex);
  console.log("At DeleteRowCells the tempArray:", tempArray);

  // Step 4: Create the new array excluding the deleted cells and including the updated cells
  const newCellsArrayAfterDelete = [...tempArray, ...toBeUpdated];

  console.log("At DeleteRowCells the toBeDeleted:", toBeDeleted);
  console.log("At DeleteRowCells the toBeUpdated:", toBeUpdated);
  console.log(
    "At DeleteRowCells the newCellsArrayAfterDelete:",
    newCellsArrayAfterDelete
  );

  // adjust the rowIndexArr for plot
  const adjustedRowIndexes = rowIndexesDisplayArr.map((index) =>
    index >= currentRowIndex ? index - 1 : index
  );
  console.log("at addNewRow the adjustedRowIndexes:", adjustedRowIndexes);

  return {
    newCellsArrayAfterDelete: newCellsArrayAfterDelete,
    toBeDeleted: toBeDeleted,
    toBeUpdated: toBeUpdated,
    updatedRowIndexesArr: adjustedRowIndexes,
  };
};
//work ok
