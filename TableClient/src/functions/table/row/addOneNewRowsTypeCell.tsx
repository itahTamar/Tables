import { DocumentRestAPIMethods } from "../../../api/docApi";

interface AddRowProp {
  serverUrl: string;
  tableIndex: number;
  rowIndexToInsert: number;
  currentColumnIndex: number;
}
//regular standalone general function to add only one row's cell to table collection
export const addOneNewRowsTypeCell = async ({
  serverUrl,
  tableIndex,
  rowIndexToInsert,
  currentColumnIndex,
}: AddRowProp) => {
  try {
    const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
      type: "cell",
      data: " ",
      columnIndex: currentColumnIndex,
      rowIndex: rowIndexToInsert,
      tableIndex: tableIndex,
    });

    if (success) {
      console.log("Cell added successfully!");
      return true;
    } else {
      console.log("Failed to add Cell.");
      return false;
    }
  } catch (error) {
    console.error("Error adding row's cell");
    return false;
  }
}; //work ok