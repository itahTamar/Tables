import { DocumentRestAPIMethods } from "../../api/docApi";
import { CellData } from "../../types/cellType";
import { findTheLastIndex } from './findTheLastIndex';

interface AddColumnProp {
  serverUrl: string;
    tableIndex: number;
    columns: CellData[];
}
//regular standalone function to add only one column type cell to table collection
export const addNewColumnsCell = async ({serverUrl, tableIndex, columns }: AddColumnProp) => {
    
    //find the last (max) column index
    //@ts-ignore
    const lastColumnIndex = findTheLastIndex({ arr: columns, indexType: "columnIndex" });
    if(lastColumnIndex === undefined) throw new Error("At addNewColumn the lastColumnIndex not defined");

    console.log("At addNewColumnsCell the lastColumnIndex:", lastColumnIndex );

    const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
      type: "column",
      data: " ",
      columnIndex: lastColumnIndex + 1,
      rowIndex: 0,
      tableIndex: tableIndex,
    });

    if (success) {
      console.log("Column added successfully!");
    } else {
      console.log("Failed to add Column.");
    }
    return;
  }; //work ok


