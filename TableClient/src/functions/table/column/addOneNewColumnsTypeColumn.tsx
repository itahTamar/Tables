import { DocumentRestAPIMethods } from "../../../api/docApi";

interface AddColumnProp {
  serverUrl: string;
  tableId: string;
  tableIndex: number;
  columnIndexToInsert: number;
}
//regular standalone function to add only one column type cell to table collection
export const addOneNewColumnsTypeColumn = async ({
  serverUrl,
  tableId,
  tableIndex,
  columnIndexToInsert,
}: AddColumnProp) => {
  try {
    const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
      type: "column",
      data: " ",
      visibility: true,
      columnIndex: columnIndexToInsert,
      rowIndex: 0,
      tableIndex: tableIndex,
      tableId
    }, "addDoc");

    if (success) {
      console.log("Column added successfully!");
      return true;
    } else {
      console.log("Failed to add Column.");
      return false;
    }
  } catch (error) {
    console.error("Error adding column's cell");
    return false
  }
}; //work ok
