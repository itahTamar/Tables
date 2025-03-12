import { DocumentRestAPIMethods } from "../../api/docApi";
import { TableData } from "../../types/tableType";

// Define a type (or interface) for your table data if you haven't already.
export async function getAllUserTables(serverUrl: string): Promise<TableData[]> {
  
  const tablesData = await DocumentRestAPIMethods.get(
    serverUrl,
    "tables",
    { type: "table" },
    "getUserDocs"
  );

  if (!tablesData) {
    throw new Error("No tables found.");
  }

  if (!Array.isArray(tablesData)) {
    throw new Error("Fetched data is not in the expected array format.");
  }

  console.log("at getAllUserTables the tablesData", tablesData)

  return tablesData;
}
