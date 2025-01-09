import { CellData } from "../../../types/cellType";
import { findTheLastIndex } from "./../findTheLastIndex";

interface DeleteColumnProp {
  currentColumnIndex: number;
  columns: CellData[];
  cells: CellData[];
}

// Function to delete one column of the table locally and return items to be deleted
export const deleteColumnCells = ({
  currentColumnIndex,
  columns,
  cells,
}: DeleteColumnProp): {
  toBeDeleted: CellData[];
  toBeUpdated: CellData[];
  newCellsArrayAfterDelete: CellData[];
  newColumnsArrayAfterDelete: CellData[];
} => {
  console.log("HELLO FROM DELETE COLUMN");

  // Find the last (max) column index
  const lastColumnIndex = findTheLastIndex({
    arr: columns,
    indexType: "columnIndex",
  });
  if (lastColumnIndex === undefined)
    throw new Error("At deleteColumnCells the lastColumnIndex not defined");

  console.log("At deleteColumnCells the lastColumnIndex:", lastColumnIndex);

  // Step 1.1: Identify column to be deleted
  const columnsToBeDeleted = columns.filter(
    (column) => column.columnIndex === currentColumnIndex
  );

  // Step 1.2: Identify cells to be deleted
  const cellsToBeDeleted = cells.filter(
    (cell) => cell.columnIndex === currentColumnIndex
  );

  const toBeDeleted = [...columnsToBeDeleted, ...cellsToBeDeleted];

  // Step 2.1: Create ColumnsToBeUpdated array
  const columnsToBeUpdated = columns
    .filter((column) => column.columnIndex > currentColumnIndex)
    .map((column) => ({ ...column, columnIndex: column.columnIndex - 1 }));

  // Step 2.2: Create CellsToBeUpdated array
  const cellsToBeUpdated = cells
    .filter((cell) => cell.columnIndex > currentColumnIndex)
    .map((cell) => ({ ...cell, columnIndex: cell.columnIndex - 1 }));

  const toBeUpdated = [...columnsToBeUpdated, ...cellsToBeUpdated];

  // Step 3.1: Create newTempColumns array excluding the deleted column and all columns after
  const newTempColumns = [
    ...columns.filter((column) => column.columnIndex < currentColumnIndex),
  ];

  console.log("At deleteColumnCells the currentColumnIndex:", currentColumnIndex);
  console.log("At deleteColumnCells the newTempColumns:", newTempColumns);

  // Step 3.2: Create newTempCells array excluding the deleted cells and all row-cells after
  const newTempCells = [
    ...cells.filter((cell) => cell.columnIndex < currentColumnIndex),
  ];

  console.log("At deleteColumnCells the newTempCells:", newTempCells);

  // Step 4.1: Create newCellsArrayAfterDelete excluding the deleted cells and including the updated cells
  const newCellsArrayAfterDelete = [...newTempCells, ...cellsToBeUpdated];

  // Step 4.2: Create newColumnsArrayAfterDelete excluding the deleted columns and including the updated columns
  const newColumnsArrayAfterDelete = [...newTempColumns, ...columnsToBeUpdated];

  console.log("At deleteColumnCells the toBeDeleted:", toBeDeleted);
  console.log("At deleteColumnCells the toBeUpdated:", toBeUpdated);
  console.log(
    "At deleteColumnCells the newCellsArrayAfterDelete:",
    newCellsArrayAfterDelete
  );
  console.log(
    "At deleteColumnCells the newColumnsArrayAfterDelete:",
    newColumnsArrayAfterDelete
  );

  return {
    newCellsArrayAfterDelete,
    newColumnsArrayAfterDelete,
    toBeDeleted,
    toBeUpdated,
  };
};
//work ok