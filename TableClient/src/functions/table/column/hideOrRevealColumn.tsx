import { CellData } from "../../../types/cellType";

interface HideOrRevealColumnProp {
  currentColumnIndex: number;
  headers: CellData[];
  cells: CellData[];
  visible: boolean;
}

export const hideOrRevealColumn = ({
  currentColumnIndex,
  headers,
  cells,
  visible, //false - want to hide, true - want to reveal
}: HideOrRevealColumnProp): {
  toBeUpdate: CellData[];
  newCellsArrayAfterChange: CellData[];
  newColumnsArrayAfterChange: CellData[];
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
  const newCellsArrayAfterChange = cells.map((cell) =>
    cell.columnIndex === indexToAction
      ? { ...cell, visibility: visible }
      : cell
  );
  const cellsToBeUpdated = newCellsArrayAfterChange.filter(
    (cell) => cell.columnIndex === indexToAction
  );

  const newColumnsArrayAfterChange = headers.map((cell) =>
    cell.columnIndex === indexToAction
      ? { ...cell, visibility: visible }
      : cell
  );
  const columnToBeUpdated = newColumnsArrayAfterChange.filter(
    (cell) => cell.columnIndex === indexToAction
  );
  const toBeUpdate = [...cellsToBeUpdated, ...columnToBeUpdated];
  return { toBeUpdate, newCellsArrayAfterChange, newColumnsArrayAfterChange };
};
