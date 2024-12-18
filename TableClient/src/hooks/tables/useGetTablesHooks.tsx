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
      });
      if (!tablesData) throw new Error("No tables found.");
      setTables(tablesData);
    } catch (error) {
      console.error("Error fetching user tables:", error);
    }
  };

  return handleGetAllUserTables;
} //work ok

// export function useGetAllTablesColumns(tableIndex:number) {
//   console.log("you at useGetAllTablesColumns")

//   const serverUrl = useContext(ServerContext);
//   const tableContext = useContext(TableContext);

//   if (!tableContext) {
//     throw new Error("TableContext must be used within a TableProvider");
//   }
//   const { setColumns } = tableContext;

//   const handleGetAllTablesColumns = async () => {
//     try {
//       const columnsData = await DocumentRestAPIMethods.get(serverUrl, "tables", {
//         type: "column", tableIndex:tableIndex
//       });
//       if (!columnsData) throw new Error("No columns found.");
//       console.log("at useGetAllTablesColumns the columnsData:", columnsData)
//       setColumns(columnsData);
//       // return columnsData; // Return fetched data
//     } catch (error) {
//       console.error("Error fetching tables columns:", error);
//       // return []
//     }
//   };

//   return handleGetAllTablesColumns;
// }

// export function useGetAllTablesCells(tableIndex:number) {
//   console.log("you at useGetAllTablesCells")
//   const serverUrl = useContext(ServerContext);
//   const tableContext = useContext(TableContext);

//   if (!tableContext) {
//     throw new Error("TableContext must be used within a TableProvider");
//   }
//   const { setCells } = tableContext;

//   const handleGetAllTablesCells = async () => {
//     try {
//       const cellsData = await DocumentRestAPIMethods.get(serverUrl, "tables", {
//         type: "cell", tableIndex:tableIndex
//       });
//       if (!cellsData) throw new Error("No cells found.");
//       console.log("at useGetAllTablesCells the cellData:",cellsData)
//       setCells(cellsData);
//       // return cellsData; // Return fetched data
//     } catch (error) {
//       console.error("Error fetching tables cells:", error);
//       // return []
//     }
//   };

//   return handleGetAllTablesCells;
// }