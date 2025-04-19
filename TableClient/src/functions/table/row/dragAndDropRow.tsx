import { CellData } from "../../../types/cellType";
import { DeleteRowCells } from "./deleteRowCells";

interface DragAndDropRowProp {
  currentRowIndex: number;
  targetRowIndex: number;
  cellsArr: CellData[];
  numOfRows: number;
  rowIndexesDisplayArr: number[];
}

export const dragAndDropRow = async ({
  currentRowIndex,
  targetRowIndex,
  cellsArr,
  numOfRows,
  rowIndexesDisplayArr,
}: DragAndDropRowProp) => {
  console.log("HELLO FROM D&D Row");
  try {
    if (currentRowIndex === 0) return; //avoid moving the header
    // Avoid performing the operation if indices are the same
    if (currentRowIndex === targetRowIndex) {
      console.warn(
        "Current and target Row indices are the same. No action taken."
      );
      return;
    }

    //grab and remove the entire Row
    const result1 = await DeleteRowCells({
      currentRowIndex,
      cells: cellsArr,
      numOfRows,
      rowIndexesDisplayArr,
    });
    if (result1 === undefined) {
      throw new Error("Result1 is undefined - collect delete Row failed");
    }
    const dndCells = result1.toBeDeleted;
    const newTempCellsArrayAfterDelete = result1.newCellsArrayAfterDelete;

    // Adjust indices of existing cells
    const adjustedCells = newTempCellsArrayAfterDelete.map((cell) => {
      if (cell.rowIndex >= targetRowIndex) {
        return { ...cell, rowIndex: cell.rowIndex + 1 };
      }
      return cell;
    });
    console.log("adjustedCells:", adjustedCells);

    //Insert the Dragged Cells (row)
    const newSortedUpdatedCells = [
      ...adjustedCells.filter((cell) => cell.rowIndex < targetRowIndex),
      ...dndCells.map((cell) => ({ ...cell, rowIndex: targetRowIndex })),
      ...adjustedCells.filter((cell) => cell.rowIndex >= targetRowIndex),
    ];
    console.log("dnd newSortedUpdatedCells:", newSortedUpdatedCells);

    const rows = newSortedUpdatedCells.reduce<Record<number, CellData[]>>(
      (acc, cell) => {
        acc[cell.rowIndex] = acc[cell.rowIndex] || [];
        acc[cell.rowIndex].push(cell);
        return acc;
      },
      {}
    );
    const newSortedUpdatedRows = Object.keys(rows)
      .map(Number)
      .sort((a, b) => a - b)
      .map(
        (rowIndex) =>
          rows[rowIndex]?.sort((a, b) => a.columnIndex - b.columnIndex) || []
      );

    // adjust the rowIndexArr for plot
    const adjustedRowIndexes = newSortedUpdatedCells.reduce<number[]>(
      (acc, item) => {  //acc=accumulator
        if (!acc.includes(item.rowIndex)) {
          acc.push(item.rowIndex);
        }
        return acc;
      },
      []
    );
    console.log(
      "at dragAndDropRow the adjustedRowIndexes:",
      adjustedRowIndexes
    );

    return {
      newSortedUpdatedRows,
      newSortedUpdatedCells,
      adjustedRowIndexes
    };
  } catch (error) {
    console.error("Error handling d&d Row:", error);
  }
};
