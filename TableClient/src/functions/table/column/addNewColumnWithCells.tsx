import { CellData } from "../../../types/cellType";
import { generateObjectId } from "../row/addNewRow";

//Function to add a new column to the table
interface AddColumnProp {
  serverUrl: string;
  tableId: string;
  tableIndex: number;
  currentColumnIndex: number;
  colIndexesDisplayArr: number[];
  headers: CellData[];
  cells: CellData[];
  addBefore: boolean;
  numOfRows: number;
}

export const addNewColumnWithCells = async ({
  tableId,
  tableIndex,
  currentColumnIndex,
  colIndexesDisplayArr,
  numOfRows,
  headers,
  cells,
  addBefore, // parameter to specify adding before/after the current column
}: AddColumnProp) => {
  if (!tableId || headers.length === 0) {
    throw new Error("Invalid input data for addNewColumnWithCells");
  }

  // Determine the new column index
  const newColumnIndex = addBefore ? currentColumnIndex : currentColumnIndex + 1;
  console.log("newColumnIndex:", newColumnIndex)
  
  // Adjust indices of existing headers
  const adjustedHeaders = headers.map((col) => {
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

  // Add the new column to the headers array
  const newHeader: CellData = {
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

  numOfRows = cells.length > 0
    ? Math.max(...cells.map(cell => cell.rowIndex))
    : 0;

  console.log("Amir!!!!!!!!!!!!! addNewColumnWithCells: numOfRows",numOfRows)


  // Add new cells for the rows corresponding to the new column
  const newCells: CellData[] = Array.from(
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
  
  // adjust the rowIndexArr for plot
  const adjustedColIndexes = colIndexesDisplayArr.map((index) =>
    index >= newColumnIndex ? index + 1 : index
  );
  adjustedColIndexes.push(newColumnIndex);

  return {
    updatedHeaders: [...adjustedHeaders, newHeader],
    updatedCells: [...adjustedCells, ...newCells],
    updatedColIndexesArr: adjustedColIndexes, 
    newlyAddedColumn: [newHeader, ...newCells],
  };
};
