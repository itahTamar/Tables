import { DocumentRestAPIMethods } from "../../../api/docApi";

interface TablesColumnsProp {
  serverUrl: string;
  tableId: string;
  // tableIndex: number;
}

export const getHeaders = async ({
  serverUrl,
  tableId,
}: TablesColumnsProp) => {
  console.log("**getHeaders**");
  try {
    const columnsData = await DocumentRestAPIMethods.get(serverUrl, "tables", {
      type: "column",
      tableId
    }, "getDoc", false);
    if (!columnsData) throw new Error("No headers found.");
    // console.log("at getHeaders the columnsData:", columnsData);
    return columnsData;
  } catch (error) {
    console.error("Error fetching tables headers:", error);
    return []
  }
}; //work ok
