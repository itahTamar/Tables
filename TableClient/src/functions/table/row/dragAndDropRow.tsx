import { CellData } from "../../../types/cellType";
import { DeleteRowCells } from "./deleteRowCells";

interface DragAndDropRowProp {
  currentRowIndex: number;
  targetRowIndex: number;
  cellsArr: CellData[];
}

export const dragAndDropRow = async ({
  currentRowIndex,
  targetRowIndex,
  cellsArr,
}: DragAndDropRowProp) => {
  console.log("HELLO FROM D&D Row");
  try {
    if (currentRowIndex === 0 || targetRowIndex === 0 || currentRowIndex === targetRowIndex) return; //avoid moving the header or Avoid performing the operation if indices are the same
 
    const unaffectedCells = cellsArr.filter((c) => c.rowIndex < Math.min(currentRowIndex,targetRowIndex) ||
     c.rowIndex > Math.max(currentRowIndex,targetRowIndex));
    console.log("dragAndDropRow.tsx: unaffectedCells =", unaffectedCells)
    let affectedCells: CellData[] = [];
    
    if (targetRowIndex<currentRowIndex){
      const minIndex = targetRowIndex;
      const maxIndex = currentRowIndex;

      // Step 1: Select all cells in the affected range (inclusive of currentColumnIndex)
      affectedCells = cellsArr.filter((cell) =>
        cell.rowIndex >= minIndex && cell.rowIndex <= maxIndex
      );

      affectedCells.forEach((cell) => {
        if (cell.rowIndex === maxIndex) {
          cell.rowIndex = minIndex; // Move original dragged row
        } else {
          cell.rowIndex += 1; // Shift others to the down
        }
      });
    }

    if (targetRowIndex>currentRowIndex){
      const maxIndex = targetRowIndex;
      const minIndex = currentRowIndex;

      // Step 1: Select all cells in the affected range (inclusive of currentColumnIndex)
      affectedCells = cellsArr.filter((cell) =>
        cell.rowIndex >= minIndex && cell.rowIndex <= maxIndex
      );

      affectedCells.forEach((cell) => {
        if (cell.rowIndex === minIndex) {
          cell.rowIndex = maxIndex; // Move original dragged row
        } else {
          cell.rowIndex -= 1; // Shift others to the up
        }
      });
    }
    
    const newCells = [...affectedCells,...unaffectedCells] 


    return {
      newCells,
      cellsToBeInxUpdate: affectedCells
    };
  } catch (error) {
    console.error("Error handling d&d Row:", error);
  }
};
