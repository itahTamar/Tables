import { DocumentRestAPIMethods } from "../../../api/docApi";

interface TablesCellsProp {
  serverUrl: string;
  tableId: string;
  // tableIndex: number;
}

export const getAllTablesCells = async ({
  serverUrl,
  tableId,
}: TablesCellsProp) => {
  console.log("you at getAllTablesCells");
  try {
    const cellsData = await DocumentRestAPIMethods.get(serverUrl, "tables", {
      type: "cell",
      tableId
    }, "getDoc", false);
    if (!cellsData) throw new Error("No cells found.");
    console.log("at getAllTablesCells the cellData:", cellsData);
    return cellsData; // Return fetched data
  } catch (error) {
    console.error("Error fetching tables cells:", error);
    return []
  }
}; //work ok
