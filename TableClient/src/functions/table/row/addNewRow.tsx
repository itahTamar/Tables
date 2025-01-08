import { DocumentRestAPIMethods } from "../../../api/docApi";
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
 * @param setCells - Function to update cells state
 */

export const addNewRow = async ({
  serverUrl,
  tableId,
  tableIndex,
  currentRowIndex,
  columns,
  cells,
  addBefore, // New parameter to specify adding before the row
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

  // Adjust rowIndex for existing cells
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

  // Batch update the database for affected cells
  const successUpdate = await Promise.all(
    affectedCells.map((cell) =>
      DocumentRestAPIMethods.update(
        serverUrl,
        "tables",
        { _id: cell._id },
        { rowIndex: cell.rowIndex }
      )
    )
  );

  //add the newRowCells to db
  const successAdd = await Promise.all(
    newRowCells.map((cell) =>
      DocumentRestAPIMethods.add(serverUrl, "tables", cell, "addDoc")
    )
  );

  if (successUpdate && successAdd) console.log("row added successfully");

  return sortedUpdatedCells;
};

/**
 * Helper function to generate a unique ID (placeholder)
 */
function generateObjectId(): string {
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
