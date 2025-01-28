import { CellData } from "../../../../types/cellType";
import { findTheLastIndex } from "../../findTheLastIndex";
import { addOneNewRowsTypeCell } from "../../row/addOneNewRowsTypeCell";
import { updateIndexes } from "../../updateIndex";
import { addOneNewCellsTypeColumn } from "../addOneNewColumnsTypeColumn";
//function to handle all cases of inserting a new column (with or without new row's-cells)
interface AddColumnProp {
  serverUrl: string;
  tableId: string;
  tableIndex: number;
  currentColumnIndex: number;
  columns: CellData[];
  cells: CellData[];
  addBefore: boolean;
}

export const addNewColumnWithCells = async ({
  serverUrl,
  tableId,
  tableIndex,
  currentColumnIndex,
  columns,
  cells,
  addBefore,
}: AddColumnProp) => {
  //find the last column index
  //@ts-ignore
  const lastColumnIndex = findTheLastIndex({
    arr: columns,
    indexType: "columnIndex",
  });

  //find the last row index
  //@ts-ignore
  const lastCellIndex = findTheLastIndex({ arr: cells, indexType: "rowIndex" });
  if (lastColumnIndex === undefined || lastCellIndex === undefined)
    throw new Error(
      "At addNewColumn the lastColumnIndex and lastCellIndex not defined"
    );

  console.log("At addNewColumn the tableIndex:", tableIndex);
  console.log("At addNewColumn the lastColumnIndex:", lastColumnIndex);
  console.log("At addNewColumn the lastCellIndex:", lastCellIndex);
  console.log("At addNewColumn the currentColumnIndex:", currentColumnIndex);

  // help fun' to Add new cells for each existing row
  const addRowsCells = async (columnIndex: number) => {
    for (let rowIndex = 1; rowIndex <= lastCellIndex; rowIndex++) {
      try {
        const success = await addOneNewRowsTypeCell({
          serverUrl,
          tableId,
          tableIndex,
          rowIndexToInsert: rowIndex,
          currentColumnIndex: columnIndex,
        });
        if (!success) {
          console.error("Failed to add new cell.");
        }
      } catch (error) {
        console.error("Error adding new cell:", error);
      }
    }
  };

  // case 0: Handle case where there are no columns (empty table)
  if (columns.length === 0 && currentColumnIndex === 0) {
    // Add the first column cell - with no row-cells (there is no rows)
    const success = await addOneNewCellsTypeColumn({
      serverUrl,
      tableId,
      tableIndex,
      columnIndexToInsert: 1,
    });
    return success;
  }

  // case 1: Handle case where there only columns and no cells (no rows)
  if (columns.length > 0 && cells.length === 0 && currentColumnIndex != 0) {
    //!case 1.1: Insert column AFTER an existing one
    if (!addBefore) {
      //case: 1.1.1: Insert at the end
      if (currentColumnIndex === lastColumnIndex) {
        console.log("case: 1.1.1: Insert at the end");
        const success = await addOneNewCellsTypeColumn({
          serverUrl,
          tableId,
          tableIndex,
          columnIndexToInsert: lastColumnIndex + 1,
        });
        return success;
      }
      //case 1.1.2: Insert not at the end
      // Step 1: Update existing column indices
      if (currentColumnIndex < lastColumnIndex && currentColumnIndex != 0) {
        console.log("case 1.1.2: Insert after not at the end");
        const updateSuccess = await updateIndexes({
          serverUrl,
          arr: [...columns, ...cells],
          currentIndex: currentColumnIndex,
          indexType: "columnIndex",
          action: "adding",
        });

        if (!updateSuccess)
          throw new Error("Failed to update indices at addNewColumnWithCells");

        //step 2: add the new column
        const success = await addOneNewCellsTypeColumn({
          serverUrl,
          tableId,
          tableIndex,
          columnIndexToInsert: currentColumnIndex + 1,
        });
        return success;
      }
    }

    //!case 1.2: Insert column BEFORE an existing one
    if (addBefore) {
      // Step 1: Update existing column indices
      console.log("case 1.2: Insert before");
      const updateSuccess = await updateIndexes({
        serverUrl,
        arr: [...columns, ...cells],
        currentIndex: currentColumnIndex-1, //will update all columnIndexes including the current
        indexType: "columnIndex",
        action: "adding",
      });

      if (!updateSuccess)
        throw new Error("Failed to update indices at addNewColumnWithCells");

      const success = await addOneNewCellsTypeColumn({
        serverUrl,
        tableIndex,
        tableId,
        columnIndexToInsert: currentColumnIndex,
      });
      return success;
    }
  }

  //case 2: Handle case where there is some column/s and cell/s
  //!case 2.1: Insert column AFTER an existing one
  if (!addBefore) {
    //case 2.1.1: Insert at the end
    if (currentColumnIndex === lastColumnIndex) {
      const success = await addOneNewCellsTypeColumn({
        serverUrl,
        tableId,
        tableIndex,
        columnIndexToInsert: lastColumnIndex + 1,
      });
      if (success) {
        addRowsCells(lastColumnIndex + 1);
        return true;
      }
    }

    //case 2.1.2: Insert not at the end
    // Step 1: Update existing column and cell indices
    if (currentColumnIndex < lastColumnIndex && currentColumnIndex != 0) {
      const updateSuccess = await updateIndexes({
        serverUrl,
        arr: [...columns, ...cells],
        currentIndex: currentColumnIndex,
        indexType: "columnIndex",
        action: "adding",
      });

      if (!updateSuccess)
        throw new Error("Failed to update indices at addNewColumnWithCells");
      //step 2: add the new column
      const success = await addOneNewCellsTypeColumn({
        serverUrl,
        tableId,
        tableIndex,
        columnIndexToInsert: currentColumnIndex + 1,
      });
      if (success) {
        //step 3: add row's cells
        addRowsCells(currentColumnIndex + 1);
        return true;
      }
    }
  }

  //!case 2.2: Insert column BEFORE an existing one
  if (addBefore) {
    const updateSuccess = await updateIndexes({
      serverUrl,
      arr: [...columns, ...cells],
      currentIndex: currentColumnIndex - 1, //will update all columnIndexes including the current
      indexType: "columnIndex",
      action: "adding",
    });

    if (!updateSuccess)
      throw new Error("Failed to update indices at addNewColumnWithCells");

    const success = await addOneNewCellsTypeColumn({
      serverUrl,
      tableIndex,
      tableId,
      columnIndexToInsert: currentColumnIndex,
    });
    if (success) {
      addRowsCells(currentColumnIndex);
      return true;
    }
  }
};
//all work ok
