import { DocumentRestAPIMethods } from "../../../api/docApi";

interface TablesColumnsProp {
  serverUrl: string;
  tableId: string;
  // tableIndex: number;
}

export const getAllTablesColumns = async ({
  serverUrl,
  tableId,
}: TablesColumnsProp) => {

  console.log("you at getAllTablesColumns");
  try {
    const columnsData = await DocumentRestAPIMethods.get(serverUrl, "tables", {
      type: "column",
      tableId
    }, "getDoc", false);
    if (!columnsData) throw new Error("No columns found.");
    console.log("at getAllTablesColumns the columnsData:", columnsData);
    return columnsData;
  } catch (error) {
    console.error("Error fetching tables columns:", error);
    return []
  }
}; //work ok
