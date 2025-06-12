import { CellData } from "../../../types/cellType";

interface AddRowProp {
  tableId: string;
  tableIndex: number;
  currentRowIndex: number;
  cells: CellData[];
  rowIndexesDisplayArr: number[];
  headers: CellData[];
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
  rowIndexesDisplayArr,
  cells,
  headers,
}: AddRowProp) => {
  if (!tableId || !tableIndex) {
    throw new Error("Invalid input data for addNewRow");
  }

  if (currentRowIndex<1) currentRowIndex = 1

  // 🟨 Determine number of columns based on current headers
  const numOfColumns = headers.length;
  
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
      _id: generateObjectId(), 
      type: "cell",
      data: null,
      visibility: true, 
      rowIndex: currentRowIndex,
      columnIndex: columnIndex + 1,
      tableIndex: tableIndex,
      tableId: tableId,
      __v: 0,
    })
  );

  // Combine the adjusted cells with the new row
  const updatedCells = [...adjustedCells, ...newRowCells];

  // adjust the rowIndexArr for plot
  const adjustedRowIndexes = rowIndexesDisplayArr.map((index) =>
    index >= currentRowIndex ? index + 1 : index
  );
  adjustedRowIndexes.push(currentRowIndex);

  return {
    newCellsArray: updatedCells,              // should be new local cells
    updatedRowIndexesArr: adjustedRowIndexes, // updates indexes to display
    newlyAddedRow: newRowCells,
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
