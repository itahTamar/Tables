import { DocumentRestAPIMethods } from "../../api/docApi";
import { CellData } from "../../types/cellType";
import { addNewColumnsCell } from "./addNewColumn";
import { findLastIndex } from "./findLastIndex";

interface AddColumnProp {
    serverUrl: string;
    tableIndex: number;
    columns: CellData[];
    cells: CellData[]
}

//add cells type and one column type to build a new column
export const addNewColumnWithCells = async ({serverUrl, tableIndex, columns, cells }: AddColumnProp) => {
  //find the last column index
  //@ts-ignore
  const lastColumnIndex = findLastIndex({ arr: columns, indexType: "columnIndex" });

  //find the last row index
  //@ts-ignore
  const lastCellIndex = findLastIndex({ arr: cells, indexType: "rowIndex" });
  if(lastColumnIndex === undefined || lastCellIndex=== undefined) throw new Error("At addNewColumn the lastColumnIndex and lastCellIndex not defined");

  console.log("At addNewColumn the tableIndex:", tableIndex);
  console.log("At addNewColumn the lastColumnIndex:", lastColumnIndex);
  console.log("At addNewColumn the lastCellIndex:", lastCellIndex);


  addNewColumnsCell({serverUrl, tableIndex, columns})  //one column cell
    //add cell as many as rows already existed
    let i = 1;
    while (i <= lastCellIndex) {
      try {
        const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
        type: "cell",
        data: null,  
        columnIndex: lastColumnIndex+1,
        rowIndex: i,
        tableIndex: tableIndex,
      });
      if (success) {
        console.log("Cell added successfully!");
        }
      } catch (error) {
        console.error("Failed to add Cell");
      }
      i++;
    }

    return true;
}; 
