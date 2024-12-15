import { useContext } from "react";
import { DocumentAPIWrapper } from "../../api/docApi";
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
      const tablesData = await DocumentAPIWrapper.get(serverUrl, "tables", {
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

export function useGetAllTablesColumns() {
  const serverUrl = useContext(ServerContext);
  const tableContext = useContext(TableContext);

  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }
  const { setColumns } = tableContext;

  const handleGetAllTablesColumns = async () => {
    try {
      const columnsData = await DocumentAPIWrapper.get(serverUrl, "tables", {
        type: "column",
      });
      if (!columnsData) throw new Error("No columns found.");
      setColumns(columnsData);
    } catch (error) {
      console.error("Error fetching tables columns:", error);
    }
  };

  return handleGetAllTablesColumns;
}

export function useGetAllTablesCells() {
  const serverUrl = useContext(ServerContext);
  const tableContext = useContext(TableContext);

  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }
  const { setCells } = tableContext;

  const handleGetAllTablesCells = async () => {
    try {
      const cellsData = await DocumentAPIWrapper.get(serverUrl, "tables", {
        type: "cell",
      });
      if (!cellsData) throw new Error("No cells found.");
      setCells(cellsData);
    } catch (error) {
      console.error("Error fetching tables cells:", error);
    }
  };

  return handleGetAllTablesCells;
}