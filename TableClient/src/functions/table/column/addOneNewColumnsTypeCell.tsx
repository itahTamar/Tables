import { DocumentRestAPIMethods } from "../../../api/docApi";

interface AddColumnProp {
  serverUrl: string;
  tableIndex: number;
  columnIndexToInsert: number;
}
//regular standalone function to add only one column type cell to table collection
export const addOneNewColumnsTypeCell = async ({
  serverUrl,
  tableIndex,
  columnIndexToInsert,
}: AddColumnProp) => {
  try {
    const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
      type: "column",
      data: " ",
      columnIndex: columnIndexToInsert,
      rowIndex: 0,
      tableIndex: tableIndex,
    });

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
