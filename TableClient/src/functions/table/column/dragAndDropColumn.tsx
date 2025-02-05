import { CellData } from "../../../types/cellType";
import { deleteColumnCells } from "./deleteColumnCells";

interface DragAndDropColumnProp {
  currentColumnIndex: number;
  targetColumnIndex: number;
  sortedColumns: CellData[];
  sortedCells: CellData[];
}

export const dragAndDropColumn = async ({
  currentColumnIndex,
  targetColumnIndex,
  sortedColumns,
  sortedCells,
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

    //grab and remove the entire column
    const result1 = await deleteColumnCells({
      currentColumnIndex,
      columns: sortedColumns,
      cells: sortedCells,
    });
    if (result1 === undefined) {
      throw new Error("Result1 is undefined - collect delete column failed");
    }
    const dndColumn = result1.toBeDeleted.filter((e) => e.rowIndex === 0);
    const dndCells = result1.toBeDeleted.filter((e) => e.rowIndex != 0);
    const newTempCellsArrayAfterDelete = result1.newCellsArrayAfterDelete;
    const newTempColumnsArrayAfterDelete = result1.newColumnsArrayAfterDelete;

    // Adjust indices of existing columns
    const adjustedColumns = newTempColumnsArrayAfterDelete.map((col) => {
      if (col.columnIndex >= targetColumnIndex) {
        return { ...col, columnIndex: col.columnIndex + 1 };
      }
      return col;
    });
    console.log("adjustedColumns:", adjustedColumns);

    // Adjust indices of existing cells
    const adjustedCells = newTempCellsArrayAfterDelete.map((cell) => {
      if (cell.columnIndex >= targetColumnIndex) {
        return { ...cell, columnIndex: cell.columnIndex + 1 };
      }
      return cell;
    });
    console.log("adjustedCells:", adjustedCells);

    //Insert the Dragged Column
    const newSortedUpdatedColumns = [
      ...adjustedColumns.filter((col) => col.columnIndex < targetColumnIndex),
      ...dndColumn.map((col) => ({ ...col, columnIndex: targetColumnIndex })),
      ...adjustedColumns.filter((col) => col.columnIndex >= targetColumnIndex),
    ];
    //Insert the Dragged Cells
    const newSortedUpdatedCells = [
      ...adjustedCells.filter((cell) => cell.columnIndex < targetColumnIndex),
      ...dndCells.map((cell) => ({ ...cell, columnIndex: targetColumnIndex })),
      ...adjustedCells.filter((cell) => cell.columnIndex >= targetColumnIndex),
    ];

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

    return {
      newSortedUpdatedColumns,
      newSortedUpdatedRows,
      newSortedUpdatedCells
    };
  } catch (error) {
    console.error("Error handling d&d column:", error);
  }
};
