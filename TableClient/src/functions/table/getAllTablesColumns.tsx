import { DocumentRestAPIMethods } from "../../api/docApi";

interface TablesColumnsProp {
  serverUrl: string;
  tableIndex: number;
}

export const getAllTablesColumns = async ({
  serverUrl,
  tableIndex,
}: TablesColumnsProp) => {

  console.log("you at getAllTablesColumns");
  try {
    const columnsData = await DocumentRestAPIMethods.get(serverUrl, "tables", {
      type: "column",
      tableIndex: tableIndex,
    });
    if (!columnsData) throw new Error("No columns found.");
    console.log("at getAllTablesColumns the columnsData:", columnsData);
    return columnsData;
  } catch (error) {
    console.error("Error fetching tables columns:", error);
    return []
  }
}; //work ok