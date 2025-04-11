import { useContext } from "react";
import { DocumentRestAPIMethods } from "../../api/docApi";
import { ServerContext } from "../../context/ServerUrlContext";
import { TablesContext } from "../../context/tableContext";

export function useGetAllUserTables() {
  const serverUrl = useContext(ServerContext);
  const tableContext = useContext(TablesContext);

  if (!tableContext) {
    throw new Error("TablesContext must be used within a TableProvider");
  }
  const { setTables, setTablesFetched } = tableContext;

  console.log("useGetAllUserTables start")
  
  const handleGetAllUserTables = async () => {
    try {
      const tablesData = await DocumentRestAPIMethods.get(serverUrl, "tables", {
        type: "table",   
      }, "getUserDocs");
      if (!tablesData) throw new Error("No tables found.");
      setTables(tablesData);
      setTablesFetched(true); // ✅ Now tablesFetched will be true after tables are loaded
    } catch (error) {
      console.error("Error fetching user tables:", error);
    }
  };

  console.log("useGetAllUserTables finish")

  return handleGetAllUserTables;
} //work ok
