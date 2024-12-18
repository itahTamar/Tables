import { DocumentRestAPIMethods } from "../../api/docApi";
import { CellData } from "../../types/cellType";

interface AddRowProp {
  serverUrl: string;
  tableIndex: number;
  columns: CellData[];
  cells: CellData[]
}

//regular function to add one row to the table, row-cell will be according to the number of columns
export const addNewRowCells = async ({serverUrl, tableIndex, columns, cells }: AddRowProp) => {
    //find last (max) column index
    const maxColumnIndexValue = columns.reduce((max, current) => {
      return current.columnIndex > max ? current.columnIndex : max;
    }, 0);

    //find last (max) row index
    const maxRowIndexValue = cells.reduce((max, current) => {
      return current.rowIndex > max ? current.rowIndex : max;
    }, 0);

    console.log("At addNewRowCells the tableIndex:", tableIndex);
    console.log("At addNewRowCells the maxRowIndexValue:", maxRowIndexValue);
    console.log("At addNewRowCells the maxColumnIndexValue:",maxColumnIndexValue);

    let i = 1;
    //if no columns (=0) the function will not create a row
    while (i <= maxColumnIndexValue) {
      try {
        const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
          type: "cell",
          data: null,
          columnIndex: i,
          rowIndex: maxRowIndexValue + 1,
          tableIndex: tableIndex,
        });
        if (success) {
          console.log("Cell added successfully!");
        } else {
          console.log("Failed to add Cell.");
        }
      } catch (error) {
        console.error("Failed to add Cell");
      }
      i++;
    }   

  return true;
};
