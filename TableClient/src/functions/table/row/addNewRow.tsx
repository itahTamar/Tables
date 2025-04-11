import { CellData } from "../../../types/cellType";

interface AddRowProp {
  tableId: string;
  tableIndex: number;
  currentRowIndex: number;
  numOfColumns: number;
  cells: CellData[];
  addBefore: boolean;
  rowIndexesArr: number[];
}

/**
 * Function to add a new row to the table
 * @param headers - Array of CellData representing headers
 * @param cells - Array of CellData representing cells
 */

export const addNewRow = async ({
  tableId,
  tableIndex,
  currentRowIndex,
  numOfColumns,
  rowIndexesArr,
  cells,
  addBefore, // parameter to specify adding before/after the current row
}: AddRowProp) => {
  console.log("At addNewRowCells the tableIndex:", tableIndex);
  console.log("At addNewRowCells the numOfColumns:", numOfColumns);
  console.log("At addNewRowCells the currentRowIndex:", currentRowIndex);
  console.log("At addNewRowCells addBefore:", addBefore);
  console.log("At addNewRowCells rowIndexesArr:", rowIndexesArr);
  
  if (!tableId || !tableIndex || !numOfColumns) {
    throw new Error("Invalid input data for addNewRow");
  }

  // Determine where to add the new row
  const newRowIndex = addBefore ? currentRowIndex : currentRowIndex + 1;

  // Adjust rowIndex for existing cells - the row before the current row to insert and the row after with adjusted rowIndex
  const adjustedCells = cells.map((cell) => {
    if (cell.rowIndex >= newRowIndex) {
      return { ...cell, rowIndex: cell.rowIndex + 1 };
    }
    return cell;
  });
  console.log("at addNewRow the adjustedCells:", adjustedCells);

  // Get hidden column indexes
  const hiddenColumnIndexes = new Set(
    cells.filter((cell) => !cell.visibility).map((cell) => cell.columnIndex)
  );

  // Create new cells for the new row based on num of columns
  const newRowCells: CellData[] = Array.from(
    { length: numOfColumns },
    (_, columnIndex) => ({
      //columnIndex by default of "Array.from" start from 0
      _id: generateObjectId(), // Placeholder function to generate a unique ID
      type: "cell",
      data: null,
      visibility: !hiddenColumnIndexes.has(columnIndex + 1), // Keep hidden headers hidden
      rowIndex: newRowIndex,
      columnIndex: columnIndex + 1,
      tableIndex: tableIndex,
      tableId: tableId,
      __v: 0,
    })
  );
  console.log("New Row Cells array:", newRowCells);

  // Combine the adjusted cells with the new row
  const updatedCells = [...adjustedCells, ...newRowCells];
  console.log("at addNewRow the updatedCells:", updatedCells);

  // Determine affected cells based on the updated state
  const affectedCells = adjustedCells.filter(
    (cell) => cell.rowIndex >= newRowIndex
  );
  console.log("at addNewRow the affectedCells:", affectedCells);

  // adjust the rowIndexArr for plot
  const adjustedRowIndexes = rowIndexesArr.map((index) =>
    index >= newRowIndex ? index + 1 : index
  );
  console.log("at addNewRow the adjustedRowIndexes:", adjustedRowIndexes);

  const addedIndex = addBefore ? 1 : currentRowIndex + 1;

  return {
    newCellsArray: updatedCells, //the combined new cells array with the new row
    toBeUpdateInDB: affectedCells, //the cell were rowIndex changed
    newToAddInDB: newRowCells, //the new row cells to add to the DB
    updatedRowIndexesArr: [...adjustedRowIndexes, addedIndex],
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
