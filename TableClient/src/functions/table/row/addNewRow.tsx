import { CellData } from "../../../types/cellType";
import { findTheLastIndex } from "../findTheLastIndex";

interface AddRowProp {
  serverUrl: string;
  tableId: string;
  tableIndex: number;
  currentRowIndex: number;
  columns: CellData[];
  cells: CellData[];
  addBefore: boolean;
}

/**
 * Function to add a new row to the table
 * @param columns - Array of CellData representing columns
 * @param cells - Array of CellData representing cells
 */

export const addNewRow = async ({
  tableId,
  tableIndex,
  currentRowIndex,
  columns,
  cells,
  addBefore, // parameter to specify adding before/after the current row
}: AddRowProp) => {
  if (!tableId || !tableIndex || columns.length === 0) {
    throw new Error("Invalid input data for addNewRow");
  }

  //find the last (max) column index
  //@ts-ignore
  const lastColumnIndex = findTheLastIndex({
    arr: columns,
    indexType: "columnIndex",
  });
  if (lastColumnIndex === undefined)
    throw new Error("At addNewRowCells the lastColumnIndex not defined");

  //find the last row index
  //@ts-ignore
  const lastCellIndex = findTheLastIndex({ arr: cells, indexType: "rowIndex" });
  if (lastColumnIndex === undefined || lastCellIndex === undefined)
    throw new Error(
      "At addNewRowCells the lastColumnIndex and lastCellIndex not defined"
    );

  console.log("At addNewRowCells the tableIndex:", tableIndex);
  console.log("At addNewRowCells the lastCellIndex:", lastCellIndex);
  console.log("At addNewRowCells the lastColumnIndex:", lastColumnIndex);
  console.log("At addNewRowCells the currentRowIndex:", currentRowIndex);
  console.log("At addNewRowCells addBefore:", addBefore);

  // Determine where to add the new row
  const newRowIndex = addBefore ? currentRowIndex : currentRowIndex + 1;

  // Create new cells for the new row based on columns
  const newRowCells: CellData[] = columns.map((column) => ({
    _id: generateObjectId(), // Placeholder function to generate a unique ID
    type: "cell",
    data: null,
    visibility: true,
    rowIndex: newRowIndex,
    columnIndex: column.columnIndex,
    tableIndex: column.tableIndex,
    tableId: tableId,
    __v: 0,
  }));
  console.log("New Row Cells array:", newRowCells);

  // Adjust rowIndex for existing cells - the row before the current row to insert and the row after with adjusted rowIndex
  const adjustedCells = cells.map((cell) => {
    if (cell.rowIndex >= newRowIndex) {
      return { ...cell, rowIndex: cell.rowIndex + 1 };
    }
    return cell;
  });
  console.log("at addNewRow the adjustedCells:", adjustedCells);

  // Combine the adjusted cells with the new row
  const updatedCells = [...adjustedCells, ...newRowCells];
  console.log("at addNewRow the updatedCells:", updatedCells);

  const sortedUpdatedCells = updatedCells.sort(
    (a, b) => a.rowIndex - b.rowIndex || a.columnIndex - b.columnIndex
  );
  console.log("at addNewRow the sortedUpdatedCells:", sortedUpdatedCells);

  // Determine affected cells based on the updated state
  const affectedCells = adjustedCells.filter(
    (cell) => cell.rowIndex >= newRowIndex
  );
  console.log("at addNewRow the affectedCells:", affectedCells);

  return {
    newCellsArray: updatedCells,     //the combined new cells array with the new row
    toBeUpdateInDB: affectedCells,  //the cell were rowIndex changed
    newToAddInDB: newRowCells       //the new row cells to add to the DB
  };
};

/**
 * Helper function to generate a unique ID (placeholder)
 */
export function generateObjectId(): string {
  // Generate a 4-byte timestamp (seconds since Unix epoch)
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, "0");

  // Generate a 3-byte machine identifier (random value)
  const machineIdentifier = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");

  // Generate a 2-byte process identifier (random value)
  const processIdentifier = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, "0");

  // Generate a 3-byte counter (random value)
  const counter = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");

  // Combine all parts into a 24-character hexadecimal ObjectId
  return `${timestamp}${machineIdentifier}${processIdentifier}${counter}`;
}
