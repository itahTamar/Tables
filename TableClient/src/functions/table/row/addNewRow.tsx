import { CellData } from "../../../types/cellType";

interface AddRowProp {
  tableId: string;
  tableIndex: number;
  currentRowIndex: number;
  numOfColumns: number;
  cells: CellData[];
  rowIndexesDisplayArr: number[];
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
  rowIndexesDisplayArr,
  cells,
}: AddRowProp) => {
  if (!tableId || !tableIndex || !numOfColumns) {
    throw new Error("Invalid input data for addNewRow");
  }

  if (currentRowIndex<1)
    currentRowIndex = 1
  // Adjust rowIndex for existing cells - the row before the current row to insert and the row after with adjusted rowIndex
  const adjustedCells = cells.map((cell) => {
    if (cell.rowIndex >= currentRowIndex) {
      return { ...cell, rowIndex: cell.rowIndex + 1 };
    }
    return cell;
  });

  // generate new cells for the new row based on num of columns
  const newRowCells: CellData[] = Array.from(
    { length: numOfColumns },
    (_, columnIndex) => ({
      //columnIndex by default of "Array.from" start from 0
      _id: generateObjectId(), // Placeholder function to generate a unique ID
      type: "cell",
      data: null,
      visibility: true, // Keep hidden headers hidden
      rowIndex: currentRowIndex,
      columnIndex: columnIndex + 1,
      tableIndex: tableIndex,
      tableId: tableId,
      __v: 0,
    })
  );

  // Combine the adjusted cells with the new row
  const updatedCells = [...adjustedCells, ...newRowCells];

  // Determine affected cells based on the updated state
  const affectedCells = adjustedCells.filter(
    (cell) => cell.rowIndex >= currentRowIndex
  );

  // adjust the rowIndexArr for plot
  const adjustedRowIndexes = rowIndexesDisplayArr.map((index) =>
    index >= currentRowIndex ? index + 1 : index
  );
  adjustedRowIndexes.push(currentRowIndex);

  return {
    newCellsArray: updatedCells,              // should be new local cells
    toBeUpdateInDB: affectedCells,            // cells to up date in DB
    newToAddInDB: newRowCells,                // cells to add into the DB
    updatedRowIndexesArr: adjustedRowIndexes, // updates indexes to display
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
