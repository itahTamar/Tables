import { useContext } from "react";
import { DocumentRestAPIMethods } from "../../api/docApi";
import { ServerContext } from "../../context/ServerUrlContext";
import { TableContext } from "../../context/tableContext";

export function useGetAllUserTables() {
  const serverUrl = useContext(ServerContext);
  const tableContext = useContext(TableContext);

  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }
  const { setTables } = tableContext;

  const handleGetAllUserTables = async () => {
    try {
      const tablesData = await DocumentRestAPIMethods.get(serverUrl, "tables", {
        type: "table",   
      }, "getUserDocs");
      if (!tablesData) throw new Error("No tables found.");
      setTables(tablesData);
    } catch (error) {
      console.error("Error fetching user tables:", error);
    }
  };

  return handleGetAllUserTables;
} //work ok
