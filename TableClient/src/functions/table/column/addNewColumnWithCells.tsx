import { CellData } from "../../../types/cellType";
import { generateObjectId } from "../row/addNewRow";

//Function to add a new column to the table
interface AddColumnProp {
  serverUrl: string;
  tableId: string;
  tableIndex: number;
  currentColumnIndex: number;
  columns: CellData[];
  cells: CellData[];
  addBefore: boolean;
  numOfRows: number;
}

export const addNewColumnWithCells = async ({
  tableId,
  tableIndex,
  currentColumnIndex,
  numOfRows,
  columns,
  cells,
  addBefore, // parameter to specify adding before/after the current column
}: AddColumnProp) => {
  if (!tableId || columns.length === 0) {
    throw new Error("Invalid input data for addNewColumnWithCells");
  }

  // Determine the new column index
  const newColumnIndex = addBefore ? currentColumnIndex : currentColumnIndex + 1;

  // Adjust indices of existing columns
  const adjustedColumns = columns.map((col) => {
    if (col.columnIndex >= newColumnIndex) {
      return { ...col, columnIndex: col.columnIndex + 1 };
    }
    return col;
  });
  
  // Adjust indices of existing cells
  const adjustedCells = cells.map((cell) => {
    if (cell.columnIndex >= newColumnIndex) {
      return { ...cell, columnIndex: cell.columnIndex + 1 };
    }
    return cell;
  });

  // Add the new column to the columns array
  const newColumn: CellData = {
    _id: generateObjectId(),
    type: "column",
    data: null,
    columnIndex: newColumnIndex,
    rowIndex: 0,
    tableIndex,
    tableId,
    visibility: true,
    __v: 0,
  };
  const updatedColumns = [...adjustedColumns, newColumn];

  // Add new cells for the rows corresponding to the new column
  const newColumnCells: CellData[] = Array.from(
    { length: numOfRows },
    (_, rowIndex) => ({
      _id: generateObjectId(),
      type: "cell",
      columnIndex: newColumnIndex,
      rowIndex: rowIndex + 1,
      tableIndex,
      tableId,
      data: null,
      visibility: true,
      __v: 0,
    })
  );
  const updatedCells = [...adjustedCells, ...newColumnCells];

  // Sort columns and cells
  const sortedUpdatedColumns = updatedColumns.sort(
    (a, b) => a.columnIndex - b.columnIndex
  );
  const sortedUpdatedCells = updatedCells.sort(
    (a, b) => a.rowIndex - b.rowIndex || a.columnIndex - b.columnIndex
  );

  // Update UI (front-end) state
  console.log("Updated columns:", sortedUpdatedColumns);
  console.log("Updated cells:", sortedUpdatedCells);

  const toBeUpdateInDB = [...adjustedColumns,...adjustedCells]
  const NewToAddInDB = [...newColumnCells, newColumn]

  return {
    updatedColumns: sortedUpdatedColumns,
    updatedCells: sortedUpdatedCells,
    toBeUpdateInDB: toBeUpdateInDB,
    newToAddInDB:NewToAddInDB,
  };
};
