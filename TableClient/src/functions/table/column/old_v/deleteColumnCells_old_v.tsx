import { DocumentRestAPIMethods } from "../../../../api/docApi";
import { CellData } from "../../../../types/cellType";
import { updateIndexes } from "../../updateIndex";
import { findTheLastIndex } from "../../findTheLastIndex";

interface deleteRowProp {
  serverUrl: string;
  tableId: string;
  tableIndex: number;
  currentColumnIndex: number;
  columns: CellData[];
  cells: CellData[];
}

//regular function to delete one row of the table
export const DeleteColumnCells = async ({
  serverUrl,
  tableId,
  tableIndex,
  currentColumnIndex,
  columns,
  cells,
}: deleteRowProp) => {
  //find the last (max) column index
  //@ts-ignore
  const lastColumnIndex = findTheLastIndex({
    arr: columns,
    indexType: "columnIndex",
  });
  if (lastColumnIndex === undefined)
    throw new Error("At DeleteRowCells the lastColumnIndex not defined");

  //find the last row index
  //@ts-ignore
  const lastCellIndex = findTheLastIndex({ arr: cells, indexType: "rowIndex" });
  if (lastColumnIndex === undefined || lastCellIndex === undefined)
    throw new Error(
      "At DeleteColumnCells the lastColumnIndex and lastCellIndex not defined"
    );

  console.log("At DeleteColumnCells the tableIndex:", tableIndex);
  console.log("At DeleteColumnCells the lastCellIndex:", lastCellIndex);
  console.log("At DeleteColumnCells the lastColumnIndex:", lastColumnIndex);
  console.log(
    "At DeleteColumnCells the currentColumnIndex:",
    currentColumnIndex
  );

  //delete the column
  //1) delete the cell-type column
  try {
    const success = await DocumentRestAPIMethods.delete(serverUrl, "tables", {
      type: "column",
      columnIndex: currentColumnIndex,
      rowIndex: 0,
      tableIndex: tableIndex,
      tableId,
    }, "deleteDoc");
    if (success) {
      console.log("Cell deleted successfully!");
    }
  } catch (error) {
    console.error("Failed to delete Cell");
  }
  //2) delete the column's cells
  let i = 1;
  while (i <= lastCellIndex) {
    try {
      const success = await DocumentRestAPIMethods.delete(serverUrl, "tables", {
        type: "cell",
        columnIndex: currentColumnIndex,
        rowIndex: i,
        tableIndex: tableIndex,
        tableId,
      }, "deleteDoc");
      if (success) {
        console.log("Cell deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete Cell");
    }
    i++;
  }
  if (currentColumnIndex === lastColumnIndex) {
    return true;
  }
  if (currentColumnIndex < lastColumnIndex) {
    console.log(
      "At DeleteColumnCells the currentColumnIndex before update:",
      currentColumnIndex
    );
    //1) update the cell-type column
    const successCol = updateIndexes({
      serverUrl,
      arr: columns,
      currentIndex: currentColumnIndex,
      indexType: "columnIndex",
      action: "subtraction",
    });
    //2) update the cell-type cell
    const successCell = updateIndexes({
      serverUrl,
      arr: cells,
      currentIndex: currentColumnIndex,
      indexType: "columnIndex",
      action: "subtraction",
    });
    if (!successCol || !successCell)
      throw new Error("Invalid currentIndex at DeleteColumnCells");
    if (successCol === undefined || successCell === undefined)
      throw new Error("updateIndexes caught an error");
    return true;
  }
};
//work ok
