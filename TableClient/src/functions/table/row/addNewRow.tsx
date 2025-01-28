import { CellData } from "../../../types/cellType";
import { findTheLastIndex } from "../findTheLastIndex";

interface AddRowProp {
  serverUrl: string;
  tableId: string;
  tableIndex: number;
  currentRowIndex: number;
  numOfRows: number;
  numOfColumns: number;
  // columns: CellData[];
  cells: CellData[];
  addBefore: boolean;
  rowIndexesArr: number[];
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
  numOfRows,
  numOfColumns,
  rowIndexesArr,
  // columns,
  cells,
  addBefore, // parameter to specify adding before/after the current row
}: AddRowProp) => {
  if (!tableId || !tableIndex || !numOfRows || !numOfColumns) {
    throw new Error("Invalid input data for addNewRow");
  }

  console.log("At addNewRowCells the tableIndex:", tableIndex);
  console.log("At addNewRowCells the numOfRows:", numOfRows);
  console.log("At addNewRowCells the numOfColumns:", numOfColumns);
  console.log("At addNewRowCells the currentRowIndex:", currentRowIndex);
  console.log("At addNewRowCells addBefore:", addBefore);

  // Adjust rowIndex for existing cells - the row before the current row to insert and the row after with adjusted rowIndex
  const adjustedCells = cells.map((cell) => {
    if (cell.rowIndex >= currentRowIndex) {
      return { ...cell, rowIndex: cell.rowIndex + 1 };
    }
    return cell;
  });
  console.log("at addNewRow the adjustedCells:", adjustedCells);

  // Determine where to add the new row
  // const newRowIndex = addBefore ? currentRowIndex : currentRowIndex + 1;

  // Create new cells for the new row based on columns
  const newRowCells: CellData[] = Array.from(
    { length: numOfColumns },
    (_, columnIndex) => ({
      _id: generateObjectId(), // Placeholder function to generate a unique ID
      type: "cell",
      data: null,
      visibility: true,
      rowIndex: currentRowIndex,
      columnIndex: columnIndex,
      tableIndex: tableIndex,
      tableId: tableId,
      __v: 0,
    })
  );
  console.log("New Row Cells array:", newRowCells);

  // Combine the adjusted cells with the new row
  const updatedCells = [...adjustedCells, ...newRowCells];
  console.log("at addNewRow the updatedCells:", updatedCells);

  // const sortedUpdatedCells = updatedCells.sort(
  //   (a, b) => a.rowIndex - b.rowIndex || a.columnIndex - b.columnIndex
  // );
  // console.log("at addNewRow the sortedUpdatedCells:", sortedUpdatedCells);

  // Determine affected cells based on the updated state
  const affectedCells = adjustedCells.filter(
    (cell) => cell.rowIndex >= currentRowIndex + 1
  );
  console.log("at addNewRow the affectedCells:", affectedCells);

  // adjust the rowIndexArr for plot
  const adjustedRowIndexes = rowIndexesArr.map((index) =>
    index >= currentRowIndex ? index + 1 : index
  );
  console.log("at addNewRow the adjustedRowIndexes:", adjustedRowIndexes);

  return {
    newCellsArray: updatedCells, //the combined new cells array with the new row
    toBeUpdateInDB: affectedCells, //the cell were rowIndex changed
    newToAddInDB: newRowCells, //the new row cells to add to the DB
    updatedRowIndexesArr: [...adjustedRowIndexes, currentRowIndex],
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
