import { CellData } from "../../../types/cellType";

interface HideOrRevealColumnProp {
  currentColumnIndex: number;
  columns: CellData[];
  cells: CellData[];
  visible: boolean;
}

export const hideOrRevealColumn = ({
  currentColumnIndex,
  columns,
  cells,
  visible, //false - want to hide, true - want to revel
}: HideOrRevealColumnProp): {
  toBeUpdate: CellData[];
  newCellsArrayAfterHide: CellData[];
  newColumnsArrayAfterHide: CellData[];
} => {
  let indexToAction = currentColumnIndex;
  // If revealing a column
  if (visible) {
    const isLeftHidden = cells.some(
      (cell) => cell.columnIndex === currentColumnIndex - 1 && !cell.visibility //visibility=false - hide 
    );
    const isRightHidden = cells.some(
      (cell) => cell.columnIndex === currentColumnIndex + 1 && !cell.visibility //visibility=false - hide 
    );
    if (isLeftHidden) {
      indexToAction = currentColumnIndex - 1;
    } else if (isRightHidden) {
      indexToAction = currentColumnIndex + 1;
    }
  }
  const newCellsArrayAfterHide = cells.map((cell) =>
    cell.columnIndex === indexToAction
      ? { ...cell, visibility: visible }
      : cell
  );
  const cellsToBeUpdated = newCellsArrayAfterHide.filter(
    (cell) => cell.columnIndex === indexToAction
  );

  const newColumnsArrayAfterHide = columns.map((cell) =>
    cell.columnIndex === indexToAction
      ? { ...cell, visibility: visible }
      : cell
  );
  const columnToBeUpdated = newColumnsArrayAfterHide.filter(
    (cell) => cell.columnIndex === indexToAction
  );
  const toBeUpdate = [...cellsToBeUpdated, ...columnToBeUpdated];
  return { toBeUpdate, newCellsArrayAfterHide, newColumnsArrayAfterHide };
};
