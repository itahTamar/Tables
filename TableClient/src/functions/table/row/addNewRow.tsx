import { DocumentRestAPIMethods } from "../../../api/docApi";
import { CellData } from "../../../types/cellType";
import { findTheLastIndex } from "../findTheLastIndex";
import { updateIndexes } from "../updateIndex";

interface AddRowProp {
  serverUrl: string;
  tableIndex: number;
  currentRowIndex: number;
  columns: CellData[];
  cells: CellData[];
  addBefore: boolean;
}

//regular function to add one row to the table, row-cells will be according to the number of columns
export const addNewRowCells = async ({
  serverUrl,
  tableIndex,
  currentRowIndex,
  columns,
  cells,
  addBefore, // New parameter to specify adding before the row
}: AddRowProp) => {
  //find the last (max) column index
  //@ts-ignore
  const lastColumnIndex = findTheLastIndex({
    arr: columns,
    indexType: "columnIndex",
  });
  if (lastColumnIndex === undefined)
    throw new Error("At addNewRowCells the lastColumnIndex not defined");

  //find the last row index
  //@ts-ignore
  const lastCellIndex = findTheLastIndex({ arr: cells, indexType: "rowIndex" });
  if (lastColumnIndex === undefined || lastCellIndex === undefined)
    throw new Error(
      "At addNewRowCells the lastColumnIndex and lastCellIndex not defined"
    );

  console.log("At addNewRowCells the tableIndex:", tableIndex);
  console.log("At addNewRowCells the maxRowIndexValue:", lastCellIndex);
  console.log("At addNewRowCells the lastColumnIndex:", lastColumnIndex);
  console.log("At addNewRowCells the currentRowIndex:", currentRowIndex);
  console.log("At addNewRowCells addBefore:", addBefore);

  if (addBefore) {
    // Step 1: Update existing row indices (greater than or equal to currentRowIndex)
    const success = await updateIndexes({
      serverUrl,
      arr: cells,
      currentIndex: currentRowIndex - 1, // Include the currentRowIndex in the update
      indexType: "rowIndex",
      action: "adding",
    });

    if (!success) throw new Error("Failed to update indices at addNewRowCells");
    if (success === undefined) throw new Error("updateIndexes caught an error");

    // Step 2: Add the new row at currentRowIndex
    for (let columnIndex = 1; columnIndex <= lastColumnIndex; columnIndex++) {
      try {
        const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
          type: "cell",
          data: null,
          columnIndex,
          rowIndex: currentRowIndex, // Add at the currentRowIndex
          tableIndex,
        });

        if (!success) {
          console.error("Failed to add new cell.");
        }
      } catch (error) {
        console.error("Error adding new cell:", error);
      }
    }
  }

  if(!addBefore){
  // Step 1: Update the row indices if required
  if (currentRowIndex < lastCellIndex) {
    const success = updateIndexes({
      serverUrl,
      arr: cells,
      currentIndex: currentRowIndex,
      indexType: "rowIndex",
      action: "adding",
    });
    if (!success) throw new Error("Invalid currentIndex at addNewRowCells");
    if (success === undefined) throw new Error("updateIndexes caught an error");
  }

  // Step 2: Add a new row with updated indices after the currentRowIndex
  let i = 1;
  const newRowIndex =
    currentRowIndex < lastCellIndex ? currentRowIndex + 1 : lastCellIndex + 1;
  while (i <= lastColumnIndex) {
    try {
      const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
        type: "cell",
        data: null,
        columnIndex: i,
        rowIndex: newRowIndex,
        tableIndex: tableIndex,
      });
      if (!success) {
        console.error("Failed to add Cell.");
      }
    } catch (error) {
      console.error("Failed to add Cell:", error);
    }
    i++;
  }
  }
  return true;
};
//work ok