import { CellData } from './../../../types/cellType';

interface DragAndDropColumnProp {
  currentColumnIndex: number;
  targetColumnIndex: number;
  headerArr: CellData[];
  cellsArr: CellData[];
}

export const dragAndDropColumn = async ({
  currentColumnIndex,
  targetColumnIndex,
  headerArr,
  cellsArr,
}: DragAndDropColumnProp) => {
  console.log("HELLO FROM D&D COLUMN");
  try {
    // Avoid performing the operation if indices are the same
    if (currentColumnIndex === targetColumnIndex) {
      console.warn(
        "Current and target column indices are the same. No action taken."
      );
      return;
    }

    const unaffectedCells = cellsArr.filter((c) => c.columnIndex < Math.min(currentColumnIndex,targetColumnIndex) ||
     c.columnIndex > Math.max(currentColumnIndex,targetColumnIndex));
    const unaffectedHeaders = headerArr.filter((h) => h.columnIndex < Math.min(currentColumnIndex,targetColumnIndex) ||
     h.columnIndex > Math.max(currentColumnIndex,targetColumnIndex));

    let affectedHeaders: CellData[] = [];
    let affectedCells: CellData[] = [];
    if (targetColumnIndex<currentColumnIndex){
      const minIndex = targetColumnIndex;
      const maxIndex = currentColumnIndex;

      // Step 1: Select all cells in the affected range (inclusive of currentColumnIndex)
      affectedCells = cellsArr.filter((cell) =>
        cell.columnIndex >= minIndex && cell.columnIndex <= maxIndex
      );
      affectedHeaders = headerArr.filter((h) =>
        h.columnIndex >= minIndex && h.columnIndex <= maxIndex
      );

      affectedCells.forEach((cell) => {
        if (cell.columnIndex === maxIndex) {
          cell.columnIndex = minIndex; // Move original dragged column
        } else {
          cell.columnIndex += 1; // Shift others to the right
        }
      });

      affectedHeaders.forEach(h=>{
        if (h.columnIndex === maxIndex) {
          h.columnIndex = minIndex; // Move original dragged column
        } else {
          h.columnIndex += 1; // Shift others to the right
        }
      })
    }

    if (targetColumnIndex>currentColumnIndex){
      const maxIndex = targetColumnIndex;
      const minIndex = currentColumnIndex;

      // Step 1: Select all cells in the affected range (inclusive of currentColumnIndex)
      affectedCells = cellsArr.filter((cell) =>
        cell.columnIndex >= minIndex && cell.columnIndex <= maxIndex
      );

      affectedHeaders = headerArr.filter((h) =>
        h.columnIndex >= minIndex && h.columnIndex <= maxIndex
      );

      affectedCells.forEach((cell) => {
        if (cell.columnIndex === minIndex) {
          cell.columnIndex = maxIndex; // Move original dragged column
        } else {
          cell.columnIndex -= 1; // Shift others to the right
        }
      });
      affectedHeaders.forEach(h=>{
        if (h.columnIndex === minIndex) {
          h.columnIndex = maxIndex; // Move original dragged column
        } else {
          h.columnIndex -= 1; // Shift others to the right
        }
      })
    }
    
    const newCells = [...affectedCells,...unaffectedCells] 
    const newHeaders = [...affectedHeaders,...unaffectedHeaders]
   
    return {
      headerToBeInxUpdate: affectedHeaders,
      cellsToBeInxUpdate: affectedCells,
      newHeaders,
      newCells
    };
  } catch (error) {
    console.error("Error handling d&d column:", error);
  }
};
