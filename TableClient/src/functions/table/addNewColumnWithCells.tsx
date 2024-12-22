import { DocumentRestAPIMethods } from "../../api/docApi";
import { CellData } from "../../types/cellType";
import { findTheLastIndex } from "./findTheLastIndex";
import { updateIndexes } from "./updateIndex";

interface AddColumnProp {
    serverUrl: string;
    tableIndex: number;
    currentColumnIndex: number, 
    columns: CellData[];
    cells: CellData[]
}

//add cells type and one column type to build a new column
export const addNewColumnWithCells = async ({serverUrl, tableIndex, currentColumnIndex, columns, cells }: AddColumnProp) => {
    // Step 0: Handle case where there are no columns
    if (columns.length === 0) {
      console.log("No existing columns. Adding the first column.");
  
      // Add the first column cell
      try {
        const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
          type: "column",
          data: null,
          columnIndex: 1, // First column index
          tableIndex,
        });
  
        if (!success) {
          console.error("Failed to add the first column cell.");
          return false;
        }
      } catch (error) {
        console.error("Error adding the first column cell:", error);
        return false;
      }
  
      // Add new cells for each existing row
      const lastRowIndex = findTheLastIndex({ arr: cells, indexType: "rowIndex" }) || 0; // Handle case with no rows
      for (let rowIndex = 1; rowIndex <= lastRowIndex; rowIndex++) {
        try {
          const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
            type: "cell",
            data: null,
            columnIndex: 1, // First column index
            rowIndex,
            tableIndex,
          });
  
          if (!success) {
            console.error("Failed to add the first cell in the first column.");
          }
        } catch (error) {
          console.error("Error adding the first cell in the first column:", error);
        }
      }
  
      return true;
    }
    
  //find the last column index
  //@ts-ignore
  const lastColumnIndex = findTheLastIndex({ arr: columns, indexType: "columnIndex" });

  //find the last row index
  //@ts-ignore
  const lastCellIndex = findTheLastIndex({ arr: cells, indexType: "rowIndex" });
  if(lastColumnIndex === undefined || lastCellIndex=== undefined) throw new Error("At addNewColumn the lastColumnIndex and lastCellIndex not defined");

  console.log("At addNewColumn the tableIndex:", tableIndex);
  console.log("At addNewColumn the lastColumnIndex:", lastColumnIndex);
  console.log("At addNewColumn the lastCellIndex:", lastCellIndex);
  console.log("At addNewColumn the currentColumnIndex:", currentColumnIndex);

  // Step 1: Update existing column and cell indices
  if (currentColumnIndex < lastColumnIndex) {
    const success = await updateIndexes({
      serverUrl,
      arr: [...columns, ...cells],
      currentIndex: currentColumnIndex,
      indexType: "columnIndex",
      action: "adding",
    });

    if (!success) throw new Error("Failed to update indices at addNewColumnWithCells");
  }

  // Step 2: Add a new column cell
  try {
    const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
      type: "column",
      data: null,
      columnIndex: currentColumnIndex + 1,
      tableIndex,
    });

    if (!success) {
      console.error("Failed to add new column cell.");
      return false;
    }
  } catch (error) {
    console.error("Error adding new column cell:", error);
    return false;
  }

  // Step 3: Add new cells for each existing row
  for (let rowIndex = 1; rowIndex <= lastCellIndex; rowIndex++) {
    try {
      const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
        type: "cell",
        data: null,
        columnIndex: currentColumnIndex + 1,
        rowIndex,
        tableIndex,
      });

      if (!success) {
        console.error("Failed to add new cell.");
      }
    } catch (error) {
      console.error("Error adding new cell:", error);
    }
  }

    return true;
}; //work ok
