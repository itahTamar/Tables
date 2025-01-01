import { DocumentRestAPIMethods } from "../../../api/docApi";
import { CellData } from "../../../types/cellType";
import { updateIndexes } from "./../updateIndex";
import { findTheLastIndex } from "./../findTheLastIndex";

interface deleteRowProp {
  serverUrl: string;
  tableId: string;
  tableIndex: number;
  currentRowIndex: number;
  columns: CellData[];
  cells: CellData[];
}

//regular function to delete one row of the table
export const DeleteRowCells = async ({
  serverUrl,
  tableId,
  tableIndex,
  currentRowIndex,
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
      "At DeleteRowCells the lastColumnIndex and lastCellIndex not defined"
    );

  console.log("At DeleteRowCells the tableIndex:", tableIndex);
  console.log("At DeleteRowCells the lastCellIndex:", lastCellIndex);
  console.log("At DeleteRowCells the lastColumnIndex:", lastColumnIndex);

  //delete the row
  //case 1 : rowIndex=0 -> delete the columns row //!only if their no cell-type rows
  if(currentRowIndex === 0 && lastCellIndex === 0) {
    let i = 1;
    while (i <= lastColumnIndex) {
      try {
        const success = await DocumentRestAPIMethods.delete(serverUrl, "tables", {
          type: "column",
          columnIndex: i,
          rowIndex: currentRowIndex,
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
  }

  //case 2: other row
  let i = 1;
  while (i <= lastColumnIndex) {
    try {
      const success = await DocumentRestAPIMethods.delete(serverUrl, "tables", {
        type: "cell",
        columnIndex: i,
        rowIndex: currentRowIndex,
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
  if (currentRowIndex === lastCellIndex) {
    return true;
  }
  if (currentRowIndex < lastCellIndex) {
    const success = updateIndexes({
      serverUrl,
      arr: cells,
      currentIndex: currentRowIndex,
      indexType: "rowIndex",
      action: "subtraction",
    });
    if (!success) throw new Error("Invalid currentIndex at deleteRowCells");
    if (success === undefined) throw new Error("updateIndexes caught an error");
    return true;
  }
};
//work ok
